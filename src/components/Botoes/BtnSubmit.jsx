import React from "react";
import { IoIosSend } from "react-icons/io";

function BtnSubmit(){
    return(
        <>

            <button className="btn-submit" type="submit">
                <div className="btnSubmitItems">
                <IoIosSend />
            <div>Enviar</div>
                </div>
                </button>
        </>
    )   
}

export default BtnSubmit;