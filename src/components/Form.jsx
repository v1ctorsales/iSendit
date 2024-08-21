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

    // Função para lidar com a submissão do formulário
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevenir comportamento padrão do formulário

        // Log dos valores capturados
        console.log('Nome do Objeto:', nomeObj);
        console.log('IP:', ip);
        console.log('Máscara:', masc);
        console.log('Descrição:', desc);

        // Enviar esses valores ao servidor
        sendFormDataComponent(nomeObj, ip, masc, desc);
    };

    const handleSelectChange = (e) => {
        setMasc(e.target.value);
    };

    return (
        <div>
            <div className="choiceObjeto">
                <button class="btn-choice">Objeto 1</button>
                <button class="btn-choice">Objeto 2</button>
                <button class="btn-choice">Objeto 3</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="formPai">
                <div className="formDiv">
                    <div class="divson" htmlFor="nomeObj">Nome</div>
                    <input 
                        type="text" 
                        id="nomeObj" 
                        value={nomeObj} 
                        onChange={(e) => setNomeObj(e.target.value)} 
                    />
                </div>
                <div className="formDiv">
                    <div class="divson"  htmlFor="ip">IP</div>
                    <input 
                        class="inputIp"
                        type="text" minlength="7" maxlength="15" size="15" pattern="^(?>(\d|[1-9]\d{2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(?1)$"
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
                    <div class="divson" htmlFor="desc">Descrição</div>
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
                            
        </div>
    );
}

function sendFormDataComponent(nomeObj, ip, masc, desc) {

    var expression = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

    if (!expression.test(ip)) {
        notify(); // Mostra a notificação se o IP for inválido
        return; // Para a execução da função se o IP for inválido
    }
    else{
        notifyOk();
    }


    console.log('Enviando dados para o servidor...');
    fetch('/api/sendFormData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomeObj, ip, masc, desc }), // Enviando os valores para o servidor
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json();
    })
    .then(data => {
        console.log('done', data);
    })
    .catch(error => {
        console.error('Erro ao enviar requisição ao backend:', error);
    });
}


export default Form;
