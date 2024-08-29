import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import cube from "../img/cube2.gif";
import BtnSubmit from "./Botoes/BtnSubmit";

const notify = () => toast.error("Houve um erro.");
const notifyIp = () => toast.error("Endereço IP inválido!");
const notifyOk = () => toast.success("Objeto enviado!");
const notifyFieldRequired = (field) => toast.error(`O campo ${field} é obrigatório.`);

function Form() {
    const [nomeObj, setNomeObj] = useState('');
    const [ip, setIp] = useState('');
    const [masc, setMasc] = useState('/1');
    const [membros, setMembros] = useState('');
    const [desc, setDesc] = useState('');
    const [fqdn, setfqdn] = useState('');
    const [localidades, setLocalidades] = useState([]);
    const [localidadeSelecionada, setLocalidadeSelecionada] = useState(''); // Novo estado para armazenar a localidade selecionada
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true);
    const [activeForm, setActiveForm] = useState('ip');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isButtonDisabled = (formType) => {
        if (formType === 'ip') {
            return nomeObj.trim() === '' || ip.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'addressGroup') {
            return nomeObj.trim() === '' || membros.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'fqdn') {
            return nomeObj.trim() === '' || fqdn.trim() === '' || localidadeSelecionada.trim() === '';
        }
        return true;
    };

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

    useEffect(() => {
        fetchLocalidades();
    }, []);

    const handleSubmit = (formType) => async (e) => {
        e.preventDefault();
        if (formType === 'ip') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (ip.trim() === '') {
                notifyFieldRequired('IP');
                return;
            }
            const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
            const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            if (!(ipv4Pattern.test(ip) || ipv6Pattern.test(ip))) {
                notifyIp();
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
        } else if (formType === 'fqdn') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (fqdn.trim() === '') {
                notifyFieldRequired('FQDN');
                return;
            }
        }
    
        setIsSubmitting(true);
    
        try {
            await sendFormDataComponent(
                formType, nomeObj, ip, masc, desc, fqdn, membros, 
                localidadeSelecionada, // Passa a localidade selecionada
                setNomeObj, setIp, setMasc, setDesc, setfqdn, setMembros, setLocalidadeSelecionada
            );
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            notify();
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    value={localidadeSelecionada} // Bind para o estado localidadeSelecionada
                                    onChange={(e) => setLocalidadeSelecionada(e.target.value)} // Atualiza estado ao selecionar
                                >
                                    <option value="">Selecione uma localidade</option> {/* Adiciona uma opção padrão */}
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
                        <BtnSubmit 
                            disabled={isButtonDisabled('fqdn')} 
                            isLoading={isSubmitting} // Passa o estado de carregamento
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
                                    value={localidadeSelecionada} // Bind para o estado localidadeSelecionada
                                    onChange={(e) => setLocalidadeSelecionada(e.target.value)} // Atualiza estado ao selecionar
                                >
                                    <option value="">Selecione uma localidade</option> {/* Adiciona uma opção padrão */}
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
                                type="text" 
                                id="membros" 
                                value={membros} 
                                onChange={(e) => setMembros(e.target.value)} 
                            />
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
                        <BtnSubmit 
                            disabled={isButtonDisabled('addressGroup')} 
                            isLoading={isSubmitting} // Passa o estado de carregamento
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
                                    value={localidadeSelecionada} // Bind para o estado localidadeSelecionada
                                    onChange={(e) => setLocalidadeSelecionada(e.target.value)} // Atualiza estado ao selecionar
                                >
                                    <option value="">Selecione uma localidade</option> {/* Adiciona uma opção padrão */}
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
                            <div className="divsondesc" htmlFor="desc">Descrição</div>
                            <input 
                                placeholder="opcional"
                                type="text" 
                                id="desc" 
                                value={desc} 
                                onChange={(e) => setDesc(e.target.value)} 
                            />
                        </div>
                        <BtnSubmit 
                            disabled={isButtonDisabled('ip')} 
                            isLoading={isSubmitting} // Passa o estado de carregamento
                        />
                    </div>
                </form>
            )}

            <ToastContainer />
        </div>
    );
}

async function sendFormDataComponent(formType, nomeObj, ip, masc, desc, fqdn, membros, localidadeSelecionada, setNomeObj, setIp, setMasc, setDesc, setfqdn, setMembros, setLocalidadeSelecionada) {
    try {
        const response = await fetch('/api/sendFormData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formType, nomeObj, ip, masc, desc, fqdn, membros, localidade: localidadeSelecionada }), // Adiciona localidadeSelecionada ao corpo da requisição
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
        setfqdn('');
        setMembros('');
        setLocalidadeSelecionada(''); // Resetar a localidade selecionada
    } catch (error) {
        console.error('Erro ao enviar requisição ao backend:', error);
        notify();
    }
}

export default Form;
