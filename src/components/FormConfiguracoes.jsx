import React, { useState } from "react";
import EditableLocalidades from "./EditableLocalidades";
import gear from "../img/gear.gif";
import EditableInterfaces from "./EditableInterfaces";
import Informacoes from "./Informacoes";

function FormConfigurar() {
    const [activeForm, setActiveForm] = useState('informacoes');

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
                    Informações
                </button>
              {//  <button
                //    className={`btn-choice ${activeForm === 'preferencias' ? 'btn-active' : ''}`}
                 //   onClick={() => setActiveForm('preferencias')}
                //>
                //</div>    Preferências
                //</button>
                }
                <button
                    className={`btn-choice ${activeForm === 'rede' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('rede')}
                >
                    Localidades
                </button>
                <button
                    className={`btn-choice ${activeForm === 'interfaces' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('interfaces')}
                >
                    Interfaces
                </button>
            </div>
            <div className="listaEditableInterfaces">
                {activeForm === 'informacoes' && <Informacoes />}
            </div>
            <div className="listaEditableLocalidades">
                {activeForm === 'rede' && <EditableLocalidades />}
            </div>
            <div className="listaEditableInterfaces">
                {activeForm === 'interfaces' && <EditableInterfaces />}
            </div>
        </>
    );
}

export default FormConfigurar;
