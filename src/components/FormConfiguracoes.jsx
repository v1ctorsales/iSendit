import React, { useState, useContext } from "react";
import EditableLocalidades from "./EditableLocalidades";
import gear from "../img/gear.gif";
import EditableInterfaces from "./EditableInterfaces";
import Informacoes from "./Informacoes";
import ImportarDados from "./ImportarDados"; // novo componente importado
import { AuthContext } from '../contexts/AuthContext';

function FormConfigurar() {
    const [activeForm, setActiveForm] = useState('informacoes');
    const { destinataria } = useContext(AuthContext);

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
                {!destinataria === false && (
                    <>
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
                    </>
                )}
                {!destinataria === false && (
                <button
                    className={`btn-choice ${activeForm === 'importar' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('importar')}
                >
                    Importar Dados
                </button>
                )}
            </div>
            <div className="listaEditableInterfaces">
                {activeForm === 'informacoes' && <Informacoes />}
            </div>
            {!destinataria === false && (
                <>
                    <div className="listaEditableLocalidades">
                        {activeForm === 'rede' && <EditableLocalidades />}
                    </div>
                    <div className="listaEditableInterfaces">
                        {activeForm === 'interfaces' && <EditableInterfaces />}
                    </div>
                </>
            )}
            <div className="listaImportarDados">
                {activeForm === 'importar' && <ImportarDados />}
            </div>
        </>
    );
}

export default FormConfigurar;
