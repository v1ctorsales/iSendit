import React, { useState } from "react";
import EditableLocalidades from "./EditableLocalidades";
import gear from "../img/gear.gif";

function FormConfigurar() {
    const [activeForm, setActiveForm] = useState('informacoes'); // Define 'rede' como o formulário inicial

    return (
        <>
            <div className="h2Obj">
                <h2>Configurações</h2>
                <img className="gearImg" src={gear} alt="Cube" />
            </div>
            <div className="choiceObjeto">
                <button
                    className={`btn-choice ${activeForm === 'informacoes' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('informacoes')}
                >
                    Informações Gerais
                </button>
                <button
                    className={`btn-choice ${activeForm === 'preferencias' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('preferencias')}
                >
                    Preferências
                </button>
                <button
                    className={`btn-choice ${activeForm === 'rede' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('rede')}
                >
                    Rede Local
                </button>
            </div>
            <div className="listaEditableLocalidades">
                {activeForm === 'rede' && <EditableLocalidades />}
            </div>
        </>
    );
}

export default FormConfigurar;
