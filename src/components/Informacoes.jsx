import React from "react";

function Informacoes(){
    return(
        <> 
        <div className="formPai" id="form_ip">
            <div className="formDiv">
            <div className="divson">Empresa</div>
                        <input
                        className="blockedInput" 
                            placeholder="opcional"
                            type="text" 
                            id="desc" 
                            value={"Empresa_teste"} 
                            disabled="true"
                            
                        />
            </div>
            <div className="formDiv">
            <div className="divson">Email</div>
                        <input
                        className="blockedInput" 
                            placeholder="opcional"
                            type="text" 
                            id="desc" 
                            value={"teste@isendit.com.br"} 
                            disabled="true"
                            
                        />
            </div>
            
        </div>
        <br></br>
        <div className="formPai" id="form_ip">
            <div className="formDiv">
            <div className="divson">Plano</div>
                        <input
                        className="blockedInput" 
                            placeholder="opcional"
                            type="text" 
                            id="desc" 
                            value={"Prata"} 
                            disabled="true"
                            
                        />
            </div>
            <div className="formDiv">
            <div className="divson">Expiração</div>
                        <input
                        className="blockedInput" 
                            placeholder="opcional"
                            type="text" 
                            id="desc" 
                            value={"29/08/2025"} 
                            disabled="true"
                            
                        />
            </div>
            
        </div>
        </>
    )
}

export default Informacoes;