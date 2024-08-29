import React, { useState, useEffect } from "react";
import fwimg from "../img/fire.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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
    const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado para controlar o envio
    const [isLoading, setLoading] = useState(false); // Estado de carregamento
    const [localidades, setLocalidades] = useState([]);
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true); // Estado para controlar o carregamento das localidades

    const isButtonDisabled = () => {
        return isSubmitting || nomeRegra.trim() === '' || porta.trim() === '' || interfaceOrigem.trim() === '' || interfaceDestino.trim() === '' ||
            objetoorigem.trim() === '' || objetodestino.trim() === '' || action.trim() === '';
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
                setIsLoadingLocalidades(false); // Conclui o carregamento das localidades
            }
        };

        fetchLocalidades();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true); // Atualizar estado para iniciar o carregamento
    
        sendFormDataComponent(
            "regrafw", nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, 
            setNomeRegra, setPorta, setInterfaceOrigem, setInterfaceDestino, setObjetoorigem, setObjetodestino, setDesc, setAction,
            setIsSubmitting, setLoading // Passar setLoading para atualizar o estado de carregamento
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
            <div className="formPai" id="form_regrasfw">

                <div className="formDiv">
                        <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="action">Localidade</div>
                        {isLoadingLocalidades ? (
                            <div className="centerDois"><AiOutlineLoading3Quarters className="loading-icon" /></div>
                        ) : (
                            <select 
                                name="localidade" 
                                id="localidade" 
                                value={action} 
                                onChange={(e) => setAction(e.target.value)} // Atualiza estado ao selecionar
                            >
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
                    <div className="formDiv">
                        <div className="divson" htmlFor="interfaceorigem">Origem</div>
                        <select 
                            name="interfaceorigem" 
                            id="interfaceorigem" 
                            value={action} 
                            onChange={(e) => setAction(e.target.value)} // Atualiza estado ao selecionar
                        >
                            <option value="">Origem 1</option>
                            <option value="">Origem 2</option>
                        </select>
                    </div>
                    <div className="formDiv">
                        <div className="divson" htmlFor="interfacedestino">Destino</div>
                        <select 
                            name="interfacedestino" 
                            id="interfacedestino" 
                            value={action} 
                            onChange={(e) => setAction(e.target.value)} // Atualiza estado ao selecionar
                        >
                            <option value="">Destino 1</option>
                            <option value="">Destino 2</option>
                        </select>
                    </div>
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
                            onChange={(e) => setAction(e.target.value)} // Atualiza estado ao selecionar
                        >
                            <option value="accept">Aceitar</option>
                            <option value="deny">Recusar</option>
                        </select>
                    </div>

                    <div className="formDiv formDivDescricao">
                        <div className="divsondesc" htmlFor="desc">Descrição</div>
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
    regrafw, nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, 
    setNomeRegra, setPorta, setInterfaceOrigem, setInterfaceDestino, setObjetoorigem, setObjetodestino, setDesc, setAction, 
    setIsSubmitting, setLoading // Adicionar setLoading como parâmetro
) {
    fetch('/api/sendFormFW', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            regrafw, 
            nomeRegra, 
            porta, 
            interfaceOrigem, 
            interfaceDestino, 
            objetoorigem, 
            objetodestino, 
            desc, 
            action 
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
    })
    .catch(error => {
        console.error('Erro ao enviar requisição ao backend:', error);
        notify(); 
    })
    .finally(() => {
        setIsSubmitting(false); 
        setLoading(false); // Atualizar estado de carregamento após o envio
    });
}

export default FormRegraFW;
