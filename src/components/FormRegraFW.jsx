import React, { useState, useEffect, useContext } from "react";
import fwimg from "../img/fire.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { UuidContext } from '../contexts/UuidContext'; // Importa o UuidContext

const notify = () => toast.error("Houve um erro.");
const notifyOk = () => toast.success("Regra de Firewall enviada!");

function FormRegraFW() {
    const [nomeRegra, setNomeRegra] = useState('');
    const [porta, setPorta] = useState('');
    const [interfaceOrigem, setInterfaceOrigem] = useState('');
    const [interfaceDestino, setInterfaceDestino] = useState('');
    const [objetoorigem, setObjetoorigem] = useState('');
    const [objetodestino, setObjetodestino] = useState('');
    const [desc, setDesc] = useState('');
    const [action, setAction] = useState('accept');
    const [localidade, setLocalidade] = useState(''); // Começa como string vazia
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isLoading, setLoading] = useState(false); 
    const [localidades, setLocalidades] = useState([]);
    const [interfaces, setInterfaces] = useState([]); 
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true); 
    const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false); 

    const { uuid } = useContext(UuidContext); // Acessa o uuid do contexto

    useEffect(() => {
        console.log('UUID from UuidContext:', uuid); // Adicione este log para verificar se o uuid está sendo acessado corretamente
    }, [uuid]);

    const isButtonDisabled = () => {
        return isSubmitting || !nomeRegra.trim() || !porta.trim() || !interfaceOrigem.trim() || !interfaceDestino.trim() ||
            !objetoorigem.trim() || !objetodestino.trim() || !action.trim() || !localidade.trim();
    };

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch('/api/getLocalidade');
                if (!response.ok) {
                    throw new Error('Erro ao buscar localidades');
                }
                const data = await response.json();
                setLocalidades(data);
            } catch (err) {
                console.error('Erro ao carregar localidades:', err);
                notify();
            } finally {
                setIsLoadingLocalidades(false);
            }
        };

        fetchLocalidades();
    }, []);

    useEffect(() => {
        if (localidade && localidade !== 'default') { // Verifica se a localidade foi selecionada
            const fetchInterfaces = async () => {
                try {
                    setIsLoadingInterfaces(true);
                    const response = await fetch(`/api/getInterfaces?localidade=${localidade}`);
                    if (!response.ok) {
                        throw new Error('Erro ao buscar interfaces');
                    }
                    const data = await response.json();
                    setInterfaces(data);
                } catch (err) {
                    console.error('Erro ao carregar interfaces:', err);
                    notify();
                } finally {
                    setIsLoadingInterfaces(false);
                }
            };

            fetchInterfaces();
        }
    }, [localidade]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true);
    
        sendFormDataComponent(
            uuid, // Passa o uuid do contexto aqui
            "regrafw", nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, localidade,
            setNomeRegra, setPorta, setInterfaceOrigem, setInterfaceDestino, setObjetoorigem, setObjetodestino, setDesc, setAction, setLocalidade,
            setIsSubmitting, setLoading
        );
    };

    return (
        <>
            <div className="topForm">
                <div className="h2Obj">
                    <h2>Envio de Regras de Firewall</h2>
                    <img className="fireImg" src={fwimg} alt="Cube" />
                </div>          
            </div>
            <div className="choiceObjeto">
                <button className={`btn-choice btn-active`}>Regras de Firewall</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={`formPai ${isLoadingLocalidades ? 'off' : ''}`} id="form_regrasfw">
                    <div className="formDiv">
                        <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="action">Localidade</div>
                        {isLoadingLocalidades ? (
                            <div className="centerDois"><AiOutlineLoading3Quarters className="loading-icon" /></div>
                        ) : (
                            <select 
                                name="localidade" 
                                id="localidade" 
                                value={localidade}
                                onChange={(e) => setLocalidade(e.target.value)}
                            >
                                <option value="default">Selecione uma localidade</option> {/* Opção padrão */}
                                {localidades.map((localidade, index) => (
                                    <option key={index} value={localidade.nome}>
                                        {localidade.nome}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="formDiv">
                        <div className="divson" htmlFor="nomeRegra">Nome</div>
                        <input 
                            type="text" 
                            id="nomeRegra" 
                            value={nomeRegra} 
                            onChange={(e) => setNomeRegra(e.target.value)} 
                        />
                    </div>
                   
                    <h4>Interfaces</h4>
                    {isLoadingInterfaces ? (
                        <div className="centerDois">
                            <AiOutlineLoading3Quarters className="loading-icon" />
                        </div>
                    ) : (
                        <>
                            <div className="formDiv">
                                <div className="divson" htmlFor="interfaceorigem">Origem</div>
                                <select 
                                    name="interfaceorigem" 
                                    id="interfaceorigem" 
                                    value={interfaceOrigem}
                                    onChange={(e) => setInterfaceOrigem(e.target.value)}
                                >
                                    <option value="">Selecione uma origem</option>
                                    {interfaces.map((iface, index) => (
                                        <option key={index} value={iface.nome}>
                                            {iface.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="formDiv">
                                <div className="divson" htmlFor="interfacedestino">Destino</div>
                                <select 
                                    name="interfacedestino" 
                                    id="interfacedestino" 
                                    value={interfaceDestino}
                                    onChange={(e) => setInterfaceDestino(e.target.value)}
                                >
                                    <option value="">Selecione um destino</option>
                                    {interfaces.map((iface, index) => (
                                        <option key={index} value={iface.nome}>
                                            {iface.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}


                    <h4>Objetos</h4>
                    <div className="formDiv">   
                        <div className="divson" htmlFor="objetoorigem">Origem</div>
                        <input 
                            placeholder="ex: AD, DataBase, FileServer"
                            type="text" 
                            id="objetoorigem" 
                            value={objetoorigem} 
                            onChange={(e) => setObjetoorigem(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">   
                        <div className="divson" htmlFor="objetodestino">Destino</div>
                        <input 
                            placeholder="ex: AD, DataBase, FileServer"
                            type="text" 
                            id="objetodestino" 
                            value={objetodestino} 
                            onChange={(e) => setObjetodestino(e.target.value)} 
                        />
                    </div>

                    <div className="formDiv">
                        <div className="divson" htmlFor="porta">Porta(s)</div>
                        <input 
                            placeholder="ex: HTTPS, HTTP, 3389"
                            type="text" 
                            id="porta" 
                            value={porta} 
                            onChange={(e) => setPorta(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">
                        <div className="divson" htmlFor="action">Ação</div>
                        <select 
                            name="action" 
                            id="action" 
                            value={action} 
                            onChange={(e) => setAction(e.target.value)} 
                        >
                            <option value="accept">Aceitar</option>
                            <option value="deny">Recusar</option>
                        </select>
                    </div>

                    <div className="formDiv formDiv

Descricao">
                        <div className="divson divsondesc" htmlFor="desc">Descrição</div>
                        <input 
                            placeholder="opcional"
                            type="text" 
                            id="desc" 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                        />
                    </div>
                    
                    <BtnSubmit disabled={isButtonDisabled()} isLoading={isLoading} />
                </div>
            </form>
            <ToastContainer />
        </>
    );
}

function sendFormDataComponent(
    uuid, // Recebe o uuid do contexto aqui
    regrafw, nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, localidade,
    setNomeRegra, setPorta, setInterfaceOrigem, setInterfaceDestino, setObjetoorigem, setObjetodestino, setDesc, setAction, setLocalidade,
    setIsSubmitting, setLoading
) {
    fetch('/api/sendFormFW', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            uuid, // Usa o uuid do contexto aqui
            regrafw, 
            nomeRegra, 
            porta, 
            interfaceOrigem, 
            interfaceDestino, 
            objetoorigem, 
            objetodestino, 
            desc, 
            action, 
            localidade 
        }), 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json();
    })
    .then(data => {
        console.log('done', data);
        notifyOk(); 

        setNomeRegra('');
        setPorta('');
        setInterfaceOrigem('');
        setInterfaceDestino('');
        setObjetoorigem('');
        setObjetodestino('');
        setDesc('');
        setAction('accept');
        setLocalidade(''); // Reseta localidade
    })
    .catch(error => {
        console.error('Erro ao enviar requisição ao backend:', error);
        notify(); 
    })
    .finally(() => {
        setIsSubmitting(false); 
        setLoading(false); 
    });
}

export default FormRegraFW;
