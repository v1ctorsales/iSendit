import React, { useState } from "react";

function PageAjuda() {
    const [activeForm, setActiveForm] = useState('contato');

    return (
        <>
            <div className="topForm">
                <div className="h2Obj">
                    <h2>Ajuda</h2>
                </div>
            </div>

            <div className="choiceObjeto">
                <button
                    className={`btn-choice ${activeForm === 'contato' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('contato')}
                >
                    Contato
                </button>
                <button
                    className={`btn-choice ${activeForm === 'atualizacoes' ? 'btn-active' : ''}`}
                    onClick={() => setActiveForm('atualizacoes')}
                >
                    Atualizações
                </button>
            </div>

            <div className="formContent">
                {activeForm === 'contato' && (
                    <div className="contatoSection" style={{ textAlign: 'left' }}>
                        <h3>Contato</h3>
                        <table style={{ width: '38%', borderCollapse: 'collapse', margin: 'auto' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Área</th>
                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Nome</th>
                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Suporte</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Gabriel Gatti</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>rengatti11@gmail.com</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Desenvolvimento</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Victor Sales</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>dev.victorsales@gmail.com</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeForm === 'atualizacoes' && (
                    <div className="atualizacoesSection">
                        <h3>Atualização 0.0.1</h3>
                        <div className="textoAtt">
                        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis reprehenderit optio veniam excepturi eos, similique eaque repudiandae repellat veritatis vel sequi aperiam quasi pariatur ipsa eum earum tempore modi tempora voluptatibus a dolore vitae nobis. Quis eaque pariatur non asperiores sint. Corrupti iure qui sequi omnis quaerat ducimus quo cupiditate?</p>
                        <div className="attData">
                            04/09/2024
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default PageAjuda;
