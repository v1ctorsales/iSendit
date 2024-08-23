import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const notify = () => toast.error("Endereço IP inválido!");
const notifyOk = () => toast.success("Objeto enviado!");

function Form() {
    // Criando estados para cada campo
    const [nomeObj, setNomeObj] = useState('');
    const [ip, setIp] = useState('');
    const [masc, setMasc] = useState('/1'); // Estado para armazenar a seleção da máscara
    const [desc, setDesc] = useState('');
    const [fqdn, setfqdn] = useState('');

    // Estado para controlar qual formulário está ativo
    const [activeForm, setActiveForm] = useState(null);

    // Função para lidar com a submissão do formulário
    const handleSubmit = (formType) => (e) => {
        e.preventDefault(); // Prevenir comportamento padrão do formulário

        // Log dos valores capturados
        console.log('Tipo de Formulário:', formType);
        console.log('Nome do Objeto:', nomeObj);
        console.log('IP:', ip);
        console.log('Máscara:', masc);
        console.log('Descrição:', desc);
        console.log('FQDN:', fqdn);

        // Enviar esses valores ao servidor
        if (formType === "ip") {
            sendFormDataComponent(formType, nomeObj, ip, masc, desc);
        } else if (formType === "fqdn") {
            sendFormDataComponent(formType, nomeObj, ip, masc, desc);
        }
        else if (formType === "addressGroup") {
            sendFormDataComponent(formType, nomeObj, ip, masc, desc);
        }
    };

    const handleSelectChange = (e) => {
        setMasc(e.target.value);
    };

    return (
        <div>
            <div className="choiceObjeto">
                <button 
                    className="btn-choice" 
                    onClick={() => setActiveForm('addressGroup')}
                >
                    Addres Group
                </button>
                <button 
                    className="btn-choice" 
                    onClick={() => setActiveForm('fqdn')}
                >
                    FQDN
                </button>
                <button 
                    className="btn-choice" 
                    onClick={() => setActiveForm('ip')}
                >
                    IP/Subnet
                </button>
            </div>
            
            {activeForm === 'ip' && (
                <form onSubmit={handleSubmit("ip")}>
                    <div className="formPai" id="form_ip">
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
                        <div className="formDiv">
                            <div className="divson" htmlFor="desc">Descrição</div>
                            <input 
                                type="text" 
                                id="desc" 
                                value={desc} 
                                onChange={(e) => setDesc(e.target.value)} 
                            />
                        </div>
                        <button type="submit">Enviar</button>
                    </div>
                </form>
            )}

            {activeForm === 'fqdn' && (
                <form onSubmit={handleSubmit("fqdn")}>
                    <div className="formPai" id="form_fqdn">
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
                            <div className="divson" htmlFor="nomeObj">FQDN</div>
                            <input 
                                type="text" 
                                id="fqdn" 
                                value={fqdn} 
                                onChange={(e) => setfqdn(e.target.value)} 
                            />
                        </div>
                        <button type="submit">Enviar</button>
                    </div>
                </form>
            )}

            {activeForm === 'addressGroup' && (
                <form onSubmit={handleSubmit("addressGroup")}>
                    <div className="formPai" id="form_addressGroup">
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
                            <div className="divson" htmlFor="nomeObj">Descrição</div>
                            <input 
                                type="text" 
                                id="fqdn" 
                                value={desc} 
                                onChange={(e) => setDesc(e.target.value)} 
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
                        <button type="submit">Enviar</button>
                    </div>
                </form>
            )}
        </div>
    );
}


function sendFormDataComponent(formType, nomeObj, ip, masc, desc) {
    if ((formType === "ip")|| formType == "addressGroup" )  {
        // Regex simplificada para validar IPv4 e IPv6
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

        // Verificação se o IP corresponde a uma das regex
        if (!(ipv4Pattern.test(ip) || ipv6Pattern.test(ip))) {
            notify();
            return;
        }
        notifyOk();
    } else if (formType === "fqdn") {
        // Lógica para validar e enviar FQDN
        notifyOk();
    }

    // Log para depuração
    console.log("Objeto enviado:", {    
        nomeObj,
        ip,
        masc,
        desc,
        formType,
    });
}


export default Form;
