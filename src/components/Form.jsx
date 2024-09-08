import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import cube from "../img/cube2.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { UuidContext } from '../contexts/UuidContext'; // Importe o UuidContext

const notify = () => toast.error("Houve um erro.");
const notifyOk = () => toast.success("Objeto enviado!");
const notifyFieldRequired = (field) => toast.error(`O campo ${field} é obrigatório.`);

function Form() {
    const { uuid } = useContext(UuidContext); // Acesse o UUID do contexto
    const [nomeObj, setNomeObj] = useState('');
    const [ip, setIp] = useState('');
    const [masc, setMasc] = useState('/1');
    const [membros, setMembros] = useState('');
    const [desc, setDesc] = useState('');
    const [obs, setObs] = useState(''); // Novo estado para observação
    const [fqdn, setfqdn] = useState('');
    const [localidades, setLocalidades] = useState([]);
    const [localidadeSelecionada, setLocalidadeSelecionada] = useState('');
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true);
    const [activeForm, setActiveForm] = useState('ip');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isButtonDisabled = (formType) => {
        if (formType === 'fqdn') {
            return nomeObj.trim() === '' || fqdn.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'ip') {
            return nomeObj.trim() === '' || ip.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'addressGroup') {
            return nomeObj.trim() === '' || membros.trim() === '' || localidadeSelecionada.trim() === '';
        }
        return true;
    };
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
    

    useEffect(() => {
        if (uuid) { // Garante que o UUID está disponível
            fetchLocalidades();
        }
    }, [uuid]); 

    const handleSubmit = (formType) => async (e) => {
        console.log('Valor da mascara:', masc);
        e.preventDefault();
    
        console.log('Valores ao submeter:', {
            nomeObj,
            ip,
            masc,
            desc,
            obs,
            fqdn,
            membros,
            localidadeSelecionada,
        });
    
        if (formType === 'fqdn') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (fqdn.trim() === '') {
                notifyFieldRequired('FQDN');
                return;
            }
        } else if (formType === 'ip') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (ip.trim() === '') {
                notifyFieldRequired('IP');
                return;
            }
        } else if (formType === 'addressGroup') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (membros.trim() === '') {
                notifyFieldRequired('Membros');
                return;
            }
        }
    
        setIsSubmitting(true);
    
        try {
            await sendFormDataComponent(
                uuid, 
                formType,
                nomeObj,
                ip,
                masc,
                desc,
                obs,
                fqdn,
                membros,
                localidadeSelecionada,
                setNomeObj,
                setIp,
                setMasc,
                setDesc,
                setObs,
                setfqdn,
                setMembros,
                setLocalidadeSelecionada
            );
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            notify();
        } finally {
            setIsSubmitting(false);
        }
    };
    
    async function sendFormDataComponent(
        uuid,
        formType,
        nomeObj,
        ip,
        masc,
        desc,
        obs,
        fqdn,
        membros,
        localidadeSelecionada,
        setNomeObj,
        setIp,
        setMasc,
        setDesc,
        setObs,
        setfqdn,
        setMembros,
        setLocalidadeSelecionada
    ) {
        try {
            const response = await fetch('/api/sendFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    uuid, // Utilize o UUID do contexto
                    formType, 
                    nomeObj, 
                    ip, 
                    masc, 
                    desc, 
                    obs, // Envia o campo de observação ao backend
                    fqdn, 
                    membros, 
                    localidade: localidadeSelecionada 
                }),
            });
    
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
    
            const data = await response.json();
            notifyOk();
    
            // Resetar todos os campos
            setNomeObj('');
            setIp('');
            setMasc('/1');
            setDesc('');
            setObs(''); // Reseta o campo de observação
            setfqdn('');
            setMembros('');
            setLocalidadeSelecionada('');
        } catch (error) {
            console.error('Erro ao enviar requisição ao backend:', error);
            notify();
        }
    }
    
    

    const handleSelectChange = (e) => {
        setMasc(e.target.value);
    };

    return (
        <div>
            <div className="topForm">
                <div className="h2Obj">
                    <h2>Envio de Objetos</h2>
                    <img className="cubeImg" src={cube} alt="Cube" />
                </div>
                <div className="choiceObjeto">
                    <button 
                        className={`btn-choice ${activeForm === 'ip' ? 'btn-active' : ''}`} 
                        onClick={() => setActiveForm('ip')}
                    >
                        IP/Subnet
                    </button>
                    <button 
                        className={`btn-choice ${activeForm === 'addressGroup' ? 'btn-active' : ''}`} 
                        onClick={() => setActiveForm('addressGroup')}
                    >
                        Address Group
                    </button>
                    <button 
                        className={`btn-choice ${activeForm === 'fqdn' ? 'btn-active' : ''}`} 
                        onClick={() => setActiveForm('fqdn')}
                    >
                        FQDN
                    </button>
                </div>
            </div>
            
            {activeForm === 'fqdn' && (
    <form onSubmit={handleSubmit("fqdn")}>
        <div className={`formPai ${isLoadingLocalidades ? 'off' : ''}`} id="form_fqdn">
            <div className="formDiv">
                <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="action">Localidade</div>
                {isLoadingLocalidades ? (
                    <div className="centerDois"><AiOutlineLoading3Quarters className="loading-icon" /></div>
                ) : (
                    <select 
                        name="localidade" 
                        id="localidade"
                        value={localidadeSelecionada} 
                        onChange={(e) => setLocalidadeSelecionada(e.target.value)}
                    >
                        <option value="">Selecione uma localidade</option>
                        {localidades.map((localidade, index) => (
                            <option key={index} value={localidade.nome}>
                                {localidade.nome}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="formDiv">
                <div className="divson" htmlFor="nomeObj">Nome</div>
                <input 
                    type="text" 
                    id="nomeObj" 
                    value={nomeObj} 
                    onChange={(e) => setNomeObj(e.target.value)} 
                />
            </div>
            <div className="formDiv">
                <div className="divson" htmlFor="fqdn">FQDN</div>
                <input 
                    type="text" 
                    id="fqdn" 
                    value={fqdn} 
                    onChange={(e) => setfqdn(e.target.value)} 
                />
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
                    />
                </div>
            <BtnSubmit 
                disabled={isButtonDisabled('fqdn')} 
                isLoading={isSubmitting} 
            />
        </div>
    </form>
)}


            {activeForm === 'addressGroup' && (
                <form onSubmit={handleSubmit("addressGroup")}>
                    <div className={`formPai ${isLoadingLocalidades ? 'off' : ''}`} id="form_addressGroup">
                        <div className="formDiv">
                            <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="action">Localidade</div>
                            {isLoadingLocalidades ? (
                                <div className="centerDois"><AiOutlineLoading3Quarters className="loading-icon" /></div>
                            ) : (
                                <select 
                                    name="localidade" 
                                    id="localidade"
                                    value={localidadeSelecionada} 
                                    onChange={(e) => setLocalidadeSelecionada(e.target.value)}
                                >
                                    <option value="">Selecione uma localidade</option>
                                    {localidades.map((localidade, index) => (
                                        <option key={index} value={localidade.nome}>
                                            {localidade.nome}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="formDiv">
                            <div className="divson" htmlFor="nomeObj">Nome</div>
                            <input 
                                type="text" 
                                id="nomeObj" 
                                value={nomeObj} 
                                onChange={(e) => setNomeObj(e.target.value)} 
                            />
                        </div>
                        <div className="formDiv">
                            <div className="divson" htmlFor="membros">Membros</div>
                            <input 
                            placeholder="ex: AD, DataBase, FileServer"
                                type="text" 
                                id="membros" 
                                value={membros} 
                                onChange={(e) => setMembros(e.target.value)} 
                            />
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
                    />
                </div>
                        <BtnSubmit 
                            disabled={isButtonDisabled('addressGroup')} 
                            isLoading={isSubmitting} 
                        />
                    </div>
                </form>
            )}

            {activeForm === 'ip' && (
                <form onSubmit={handleSubmit("ip")}>
                    <div className="formPai" id="form_ip">
                        <div className="formDiv">
                            <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="action">Localidade</div>
                            {isLoadingLocalidades ? (
                                <div className="centerDois"><AiOutlineLoading3Quarters className="loading-icon" /></div>
                            ) : (
                                <select 
                                    name="localidade" 
                                    id="localidade"
                                    value={localidadeSelecionada} 
                                    onChange={(e) => setLocalidadeSelecionada(e.target.value)}
                                >
                                    <option value="">Selecione uma localidade</option>
                                    {localidades.map((localidade, index) => (
                                        <option key={index} value={localidade.nome}>
                                            {localidade.nome}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="formDiv">
                            <div className="divson" htmlFor="nomeObj">Nome</div>
                            <input 
                                type="text" 
                                id="nomeObj" 
                                value={nomeObj} 
                                onChange={(e) => setNomeObj(e.target.value)} 
                            />
                        </div>
                        <div className="formDiv">
                            <div className="divson" htmlFor="ip">IP</div>
                            <input 
                                className="inputIp"
                                type="text" 
                                minLength="7" 
                                maxLength="15" 
                                size="15" 
                                pattern="^(?>(\d|[1-9]\d{2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(?1)$"
                                id="ip" 
                                value={ip} 
                                onChange={(e) => setIp(e.target.value)} 
                            />
                            <select 
                                id="mascara" 
                                value={masc} 
                                onChange={handleSelectChange}
                            >
                                {Array.from({ length: 32 }, (_, i) => (
                                    <option key={i} value={`/${i + 1}`}>
                                        /{i + 1}
                                    </option>
                                ))}
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
                    />
                </div>
                        <BtnSubmit 
                            disabled={isButtonDisabled('ip')} 
                            isLoading={isSubmitting} 
                        />
                    </div>
                </form>
            )}

            <ToastContainer />
        </div>
    );
}

async function sendFormDataComponent(uuid, formType, nomeObj, ip, masc, desc, obs, fqdn, membros, localidadeSelecionada, setNomeObj, setIp, setMasc, setDesc, setObs, setfqdn, setMembros, setLocalidadeSelecionada) {
    try {
        const response = await fetch('/api/sendFormData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                uuid, // Utilize o UUID do contexto
                formType, 
                nomeObj, 
                ip, 
                masc, 
                desc, 
                obs, // Envia o campo de observação ao backend
                fqdn, 
                membros, 
                localidade: localidadeSelecionada 
            }),
        });

        if (!response.ok) {
            throw new Error('Erro na requisição');
        }

        const data = await response.json();
        console.log('done', data);
        notifyOk();

        // Resetar todos os campos
        setNomeObj('');
        setIp('');
        setMasc('/1');
        setDesc('');
        setObs(''); // Reseta o campo de observação
        setfqdn('');
        setMembros('');
        setLocalidadeSelecionada('');
    } catch (error) {
        console.error('Erro ao enviar requisição ao backend:', error);
        notify();
    }
}

export default Form;
