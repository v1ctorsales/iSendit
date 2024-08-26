import React from "react";
import { IoIosSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function BtnSubmit({ disabled, isLoading }) {
    return (
        <button 
            className="btn-submit" 
            type="submit" 
            disabled={disabled || isLoading} // Desativa o botão se estiver carregando ou se for desativado
        >
            <div className="btnSubmitItems">
                {isLoading ? (
                    <>
                        <AiOutlineLoading3Quarters className="loading-icon" />
                        <div>Enviando...</div>
                    </>
                ) : (
                    <>
                        <IoIosSend />
                        <div>Enviar</div>
                    </>
                )}
            </div>
        </button>
    );
}

export default BtnSubmit;
