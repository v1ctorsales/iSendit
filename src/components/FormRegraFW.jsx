import React, { useState, useEffect, useContext } from "react";
import fwimg from "../img/fire.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { AuthContext } from "../contexts/AuthContext";

const notify = () => toast.error("Houve um erro.");
const notifyOk = () => toast.success("Regra de Firewall enviada!");

function FormRegraFW() {
    const [nomeRegra, setNomeRegra] = useState('');
    const [porta, setPorta] = useState('');
    const [nat, setNat] = useState('disable'); // Novo estado para NAT
    const [interfaceOrigem, setInterfaceOrigem] = useState('');
    const [interfaceDestino, setInterfaceDestino] = useState('');
    const [objetoorigem, setObjetoorigem] = useState('');
    const [objetouser, setObjetoUser] = useState('');
    const [objetogrupo, setObjetoGrupo] = useState('');
    const [objetodestino, setObjetodestino] = useState('');
    const [desc, setDesc] = useState('');
    const [action, setAction] = useState('accept');
    const [localidade, setLocalidade] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isLoading, setLoading] = useState(false); 
    const [localidades, setLocalidades] = useState([]);
    const [interfaces, setInterfaces] = useState([]); 
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true); 
    const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false); 
    const [obs, setObs] = useState(''); 
    

    const { uuid, empresaPai  } = useContext(AuthContext);
    const { isAuthenticated, destinataria } = useContext(AuthContext); 

    useEffect(() => {
        if (uuid && destinataria !== undefined) {
            console.log('UUID from UuidContext:', uuid); 
        }
    }, [uuid, destinataria]);
    
    const isButtonDisabled = () => {
        return isSubmitting || !nomeRegra.trim() || !porta.trim() || !interfaceOrigem.trim() || !interfaceDestino.trim() ||
            !objetoorigem.trim() || !objetodestino.trim() || !action.trim() || !localidade.trim();
    };

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch(`/api/getInterfaceOuLocalidade?type=localidades&empresa=${uuid}`);
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
    
        if (uuid) {
            fetchLocalidades();
        }
    }, [uuid]);
    

    useEffect(() => {
        if (localidade && localidade !== 'default') {
            const fetchInterfaces = async () => {
                try {
                    setIsLoadingInterfaces(true);
                    console.log(localidade, uuid)
                    const response = await fetch(`/api/getInterfaceOuLocalidade?type=interfaces&localidade=${localidade}&empresa=${uuid}`);
                    if (!response.ok) {
                        throw new Error('Erro ao buscar interfaces');
                    }
                    const data = await response.json();
                    
                    const interfacesComAny = [{ nome: "any" }, ...data];

                setInterfaces(interfacesComAny);
                } catch (err) {
                    console.error('Erro ao carregar interfaces:', err);
                    notify();
                } finally {
                    setIsLoadingInterfaces(false);
                }
            };
    
            if (uuid) {
                fetchInterfaces();
            }
        }
    }, [localidade, uuid]);
    
    

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true);
    
        // Converter o campo porta para uppercase
        const portaUppercase = porta.toUpperCase();
    
        sendFormDataComponent({
            uuid,
            empresaPai,
            regrafw: "regrafw",
            nomeRegra,
            porta: portaUppercase,  // Enviar o valor como uppercase
            interfaceOrigem,
            interfaceDestino,
            objetoorigem,
            objetodestino,
            objetouser,
            objetogrupo,
            desc,
            obs,
            action,
            localidade,
            nat, // Adicionar o campo NAT aqui
            status: "aberto"
        })
        .then(() => {
            // Resetar os campos após o envio
            setNomeRegra('');
            setPorta('');
            setInterfaceOrigem('');
            setInterfaceDestino('');
            setObjetoorigem('');
            setObjetoUser('');
            setObjetoGrupo('');
            setObjetodestino('');
            setDesc('');
            setAction('accept');
            //setLocalidade('');
            setNat('disable'); // Resetar o valor de NAT
            setObs('');
            notifyOk();
        })
        .catch((error) => {
            console.error('Erro ao enviar requisição ao backend:', error);
            notify();
        })
        .finally(() => {
            setIsSubmitting(false);
            setLoading(false);
        });
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
                                //<option value="default">Selecione uma localidade</option> 
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
                            placeholder="all, DataBase, FileServer"
                            type="text" 
                            id="objetoorigem" 
                            value={objetoorigem} 
                            onChange={(e) => setObjetoorigem(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">   
                        <div className="divson" htmlFor="objetouser">User(s)</div>
                        <input 
                            placeholder="it.admin, user.vpn, cloud.admin"
                            type="text" 
                            id="objetouser" 
                            value={objetouser} 
                            onChange={(e) => setObjetoUser(e.target.value)} 
                        />
                    </div>

                    <div className="formDiv">   
                        <div className="divson" htmlFor="objetogrupo">Grupo(s)</div>
                        <input 
                            placeholder="ADM, IT, Dev"
                            type="text" 
                            id="objetogrupo" 
                            value={objetogrupo} 
                            onChange={(e) => setObjetoGrupo(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">   
                        <div className="divson" htmlFor="objetodestino">Destino</div>
                        <input 
                            placeholder="all, DataBase, FileServer"
                            type="text" 
                            id="objetodestino" 
                            value={objetodestino} 
                            onChange={(e) => setObjetodestino(e.target.value)} 
                        />
                    </div>

                    <div className="formDiv">
                        <div className="divson" htmlFor="porta">Porta(s)</div>
                        <input 
                            placeholder="ALL, HTTPS, 3389"
                            type="text" 
                            id="porta" 
                            value={porta} 
                            onChange={(e) => setPorta(e.target.value)} 
                        />
                    </div>
                    
                    <div className="formDiv">
                        <div className="divson" htmlFor="nat">NAT</div>
                        <select 
                            name="nat" 
                            id="nat" 
                            value={nat} 
                            onChange={(e) => setNat(e.target.value)}
                        >
                            <option value="disable">Desativado</option>
                            <option value="enable">Ativado</option>
                        </select>
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

                    <div className="formDiv formDivDescricao">
                        <div className="divson divsondesc" htmlFor="desc">Descrição</div>
                        <input 
                            placeholder="Um comentário que irá pro Firewall"
                            type="text" 
                            id="desc" 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">
                    <div className="divson divsondesc" htmlFor="obs">Observação</div>
                    <textarea 
                    className="inputObs"
                        type="textarea"
                        placeholder="Uma mensagem para quem for criar a regra"
                        id="obs" 
                        value={obs} 
                        onChange={(e) => setObs(e.target.value)} 
                        textarea/>
                </div>

                    
                    <BtnSubmit disabled={isButtonDisabled()} isLoading={isLoading} />
                </div>
            </form>
            <ToastContainer />
        </>
    );
}

function sendFormDataComponent(data) {
    return fetch('/api/sendFormFW', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json();
    });
}

export default FormRegraFW;
