import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import cube from "../img/cube2.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { AuthContext } from '../contexts/AuthContext';
import { Autocomplete, TextField} from '@mui/material';

const notify = () => toast.error("Houve um erro.");
const notifyOk = () => toast.success("Objeto enviado!");
const notifyFieldRequired = (field) => toast.error(`O campo ${field} é obrigatório.`);

function Form() {
    const { uuid, empresaPai, destinataria } = useContext(AuthContext);// Acesse o UUID do contexto
    const [nomeObj, setNomeObj] = useState('');
    const [ip, setIp] = useState('');
    const [masc, setMasc] = useState('/1');
    const [membros, setMembros] = useState('');
    const [desc, setDesc] = useState('');
    const [obs, setObs] = useState(''); // Novo estado para observação
    const [fqdn, setfqdn] = useState('');
    const [localidades, setLocalidades] = useState([]);
    const [localidadeSelecionada, setLocalidadeSelecionada] = useState('');
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true);
    const [activeForm, setActiveForm] = useState('ip');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const empresaId = destinataria ? uuid : empresaPai;
    const [objetos, setObjetos] = useState([]);
const [isLoadingObjetos, setIsLoadingObjetos] = useState(false);
const [membrosSelecionados, setMembrosSelecionados] = useState([]);


    const isButtonDisabled = (formType) => {
        if (formType === 'fqdn') {
            return nomeObj.trim() === '' || fqdn.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'ip') {
            return nomeObj.trim() === '' || ip.trim() === '' || localidadeSelecionada.trim() === '';
        } else if (formType === 'addressGroup') {
            return nomeObj.trim() === '' || membros.trim() === '' || localidadeSelecionada.trim() === '';
        }
        return true;
    };
    const fetchLocalidades = async () => {
        try {
            const response = await fetch(`/api/getInterfaceOuLocalidade?type=localidades&empresa=${empresaId}`);
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
        if (empresaId) { // Garante que o UUID está disponível
            fetchLocalidades();
        }
    }, [empresaId]); 

    const handleSubmit = (formType) => async (e) => {
        console.log('Valor da mascara:', masc);
        e.preventDefault();

        const empresaDestinoUuid = empresaPai;
    
        console.log('Valores ao submeter:', {
            nomeObj,
            ip,
            masc,
            desc,
            obs,
            fqdn,
            membros,
            localidadeSelecionada,
            empresaDestinoUuid
        });
    
        if (formType === 'fqdn') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (fqdn.trim() === '') {
                notifyFieldRequired('FQDN');
                return;
            }
        } else if (formType === 'ip') {
            if (nomeObj.trim() === '') {
                notifyFieldRequired('Nome');
                return;
            }
            if (ip.trim() === '') {
                notifyFieldRequired('IP');
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
        }
    
        setIsSubmitting(true);
    
        try {
            await sendFormDataComponent(
                uuid, 
                formType,
                nomeObj,
                ip,
                masc,
                desc,
                obs,
                fqdn,
                membros,
                localidadeSelecionada,
                empresaDestinoUuid,
                setNomeObj,
                setIp,
                setMasc,
                setDesc,
                setObs,
                setfqdn,
                setMembros,
                setLocalidadeSelecionada
            );
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            notify();
        } finally {
            setIsSubmitting(false);
        }
    };
    
    async function sendFormDataComponent(
        uuid,
        formType,
        nomeObj,
        ip,
        masc,
        desc,
        obs,
        fqdn,
        membros,
        localidadeSelecionada,
        empresaDestinoUuid,
        setNomeObj,
        setIp,
        setMasc,
        setDesc,
        setObs,
        setfqdn,
        setMembros,
        setLocalidadeSelecionada
    ) {
        try {
            const response = await fetch('/api/sendFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    uuid, // Utilize o UUID do contexto
                    formType, 
                    nomeObj, 
                    ip, 
                    masc, 
                    desc, 
                    obs, // Envia o campo de observação ao backend
                    fqdn, 
                    membros, 
                    localidade: localidadeSelecionada,
                    empresa_destino_uuid: empresaDestinoUuid,
                    status: "aberto"
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // ✅ captura do erro detalhado
                throw new Error(errorData.message || 'Erro na requisição');
            }
    
            const data = await response.json();
            console.log('done', data);
            notifyOk();
            // Resetar todos os campos
            setNomeObj('');
            setIp('');
            setMasc('/1');
            setDesc('');
            setObs('');
            setfqdn('');
            setMembros('');
            setLocalidadeSelecionada('');
        } catch (error) {
            console.error('Erro ao enviar requisição ao backend:', error);
            toast.error(error.message || 'Houve um erro.');
        }
    }

    useEffect(() => {
        if (localidadeSelecionada) {
            const fetchObjetos = async () => {
                try {
                    setIsLoadingObjetos(true);
                    setMembrosSelecionados([]);
                    setMembros('');

                    const response = await fetch(`/api/handleObjects?empresa=${empresaId}&localidade=${localidadeSelecionada}`);
                    if (!response.ok) {
                        throw new Error('Erro ao buscar objetos');
                    }
                    const data = await response.json();
                    setObjetos(data);
                    console.log('Objetos recebidos:', data);
                } catch (err) {
                    console.error('Erro ao carregar objetos:', err);
                    notify();
                } finally {
                    setIsLoadingObjetos(false);
                }
            };
            fetchObjetos();
        }
    }, [localidadeSelecionada, empresaId]);
    
    
    

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
  <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="localidade">
    Localidade
  </div>
  {isLoadingLocalidades ? (
    <div className="centerDois">
      <AiOutlineLoading3Quarters className="loading-icon" />
    </div>
  ) : (
    <Autocomplete
      id="localidade"
      options={localidades.map(loc => ({ label: loc.nome, value: loc.nome }))}
      getOptionLabel={opt => opt.label}
      value={
        localidades
          .map(loc => ({ label: loc.nome, value: loc.nome }))
          .find(o => o.value === localidadeSelecionada) || null
      }
      onChange={(_, newOpt) => setLocalidadeSelecionada(newOpt?.value || '')}
      disableClearable
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Selecione uma localidade"
        />
      )}
      ListboxProps={{ sx: { fontSize: '0.8em' } }}
      sx={{
        width: 490,
        '& .MuiInputBase-root': {
          fontSize: '0.8em',
          padding: '4px !important'
        },
        '& .MuiAutocomplete-endAdornment': {
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)'
        }
      }}
    />
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
                <div className="divson" htmlFor="fqdn">FQDN</div>
                <input 
                    type="text" 
                    id="fqdn" 
                    value={fqdn} 
                    onChange={(e) => setfqdn(e.target.value)} 
                />
            </div>
            <div className="formDiv formDivDescricao">
                        <div className="divson divsondesc" htmlFor="desc">Descrição</div>
                        <input 
                            placeholder="Um comentário que irá pro Firewall"
                            type="text" 
                            id="desc" 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">
                    <div className="divson divsondesc" htmlFor="obs">Observação</div>
                    <textarea 
                    className="inputObs"
                        type="textarea"
                        placeholder="Uma mensagem para quem for criar a regra"
                        id="obs" 
                        value={obs} 
                        onChange={(e) => setObs(e.target.value)} 
                    />
                </div>
            <BtnSubmit 
                disabled={isButtonDisabled('fqdn')} 
                isLoading={isSubmitting} 
            />
        </div>
    </form>
)}


            {activeForm === 'addressGroup' && (
                <form onSubmit={handleSubmit("addressGroup")}>
                    <div className={`formPai ${isLoadingLocalidades ? 'off' : ''}`} id="form_addressGroup">
                    <div className="formDiv">
  <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="localidade">
    Localidade
  </div>
  {isLoadingLocalidades ? (
    <div className="centerDois">
      <AiOutlineLoading3Quarters className="loading-icon" />
    </div>
  ) : (
    <Autocomplete
      id="localidade"
      options={localidades.map(loc => ({ label: loc.nome, value: loc.nome }))}
      getOptionLabel={opt => opt.label}
      value={
        localidades
          .map(loc => ({ label: loc.nome, value: loc.nome }))
          .find(o => o.value === localidadeSelecionada) || null
      }
      onChange={(_, newOpt) => setLocalidadeSelecionada(newOpt?.value || "")}
      disableClearable
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Selecione uma localidade"
        />
      )}
      ListboxProps={{ sx: { fontSize: "0.8em" } }}
      sx={{
        width: 490,
        "& .MuiInputBase-root": {
          fontSize: "0.8em",
          padding: "4px !important"
        },
        "& .MuiAutocomplete-endAdornment": {
          right: 10,
          top: "50%",
          transform: "translateY(-50%)"
        }
      }}
    />
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
    {isLoadingObjetos ? (
        <div className="centerDois">
            <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
    ) : (
        <Autocomplete
            multiple
            id="membros"
            options={objetos}  // ✅ usa os dados buscados
            getOptionLabel={(option) => option.nome}
            renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '1em', lineHeight: 1.5 }}>
                    {option.nome}
                </li>
            )}
            value={membrosSelecionados}
            onChange={(_, newValue) => {
                setMembrosSelecionados(newValue);
                setMembros(newValue.map(o => o.nome).join(', '));
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, idx) => (
                    <span
                        {...getTagProps({ index: idx })}
                        style={{
                            display: 'inline-block',
                            background: '#e0e0e0',
                            borderRadius: '16px',
                            padding: '4px 8px',
                            margin: '2px',
                            fontSize: '0.75em',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {option.nome}
                    </span>
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Selecione membros (Address Group)"
                />
            )}
            ListboxProps={{
                sx: { fontSize: '0.8em' }
            }}
            sx={{
                width: 490,
                '& .MuiInputBase-root': {
                    fontSize: '0.8em',
                    padding: '4px !important'
                },
                '& .MuiAutocomplete-endAdornment': {
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)'
                }
            }}
        />
    )}
</div>


                        <div className="formDiv formDivDescricao">
                        <div className="divson divsondesc" htmlFor="desc">Descrição</div>
                        <input 
                            placeholder="Um comentário que irá pro Firewall"
                            type="text" 
                            id="desc" 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">
                    <div className="divson divsondesc" htmlFor="obs">Observação</div>
                    <textarea 
                    className="inputObs"
                        type="textarea"
                        placeholder="Uma mensagem para quem for criar a regra"
                        id="obs" 
                        value={obs} 
                        onChange={(e) => setObs(e.target.value)} 
                    />
                </div>
                        <BtnSubmit 
                            disabled={isButtonDisabled('addressGroup')} 
                            isLoading={isSubmitting} 
                        />
                    </div>
                </form>
            )}

            {activeForm === 'ip' && (
                <form onSubmit={handleSubmit("ip")}>
                    <div className="formPai" id="form_ip">
                    <div className="formDiv">
  <div className={`divson ${isLoadingLocalidades ? 'off' : ''}`} htmlFor="localidade">
    Localidade
  </div>
  {isLoadingLocalidades ? (
    <div className="centerDois">
      <AiOutlineLoading3Quarters className="loading-icon" />
    </div>
  ) : (
    <Autocomplete
      id="localidade2"
      options={localidades.map(loc => ({ label: loc.nome, value: loc.nome }))}
      getOptionLabel={opt => opt.label}
      value={
        localidades
          .map(loc => ({ label: loc.nome, value: loc.nome }))
          .find(o => o.value === localidadeSelecionada) || null
      }
      onChange={(_, newOpt) => setLocalidadeSelecionada(newOpt?.value || "")}
      disableClearable
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Selecione uma localidade"
          size="small"
        />
      )}
      ListboxProps={{ sx: { fontSize: "0.8em" } }}
      sx={{
        width: 490,
        "& .MuiInputBase-root": {
          fontSize: "0.8em",
          padding: "4px !important",
        },
        "& .MuiAutocomplete-endAdornment": {
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
        },
      }}
    />
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
                                pattern="^(?>(\d|[1-9]\d{2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(?1)$" // Adicionar validaçao pra ipv4/ipv6
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
                        <div className="divson divsondesc" htmlFor="desc">Descrição</div>
                        <input 
                            placeholder="Um comentário que irá pro Firewall"
                            type="text" 
                            id="desc" 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                        />
                    </div>
                    <div className="formDiv">
                    <div className="divson divsondesc" htmlFor="obs">Observação</div>
                    <textarea 
                    className="inputObs"
                        type="textarea"
                        placeholder="Uma mensagem para quem for criar a regra"
                        id="obs" 
                        value={obs} 
                        onChange={(e) => setObs(e.target.value)} 
                    />
                </div>
                        <BtnSubmit 
                            disabled={isButtonDisabled('ip')} 
                            isLoading={isSubmitting} 
                        />
                    </div>
                </form>
            )}

            <ToastContainer />
        </div>
    );
}

async function sendFormDataComponent(uuid, formType, nomeObj, ip, masc, desc, obs, fqdn, membros, localidadeSelecionada, setNomeObj, setIp, setMasc, setDesc, setObs, setfqdn, setMembros, setLocalidadeSelecionada) {
    try {
        const response = await fetch('/api/sendFormData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                uuid, // Utilize o UUID do contexto
                formType, 
                nomeObj, 
                ip, 
                masc, 
                desc, 
                obs, // Envia o campo de observação ao backend
                fqdn, 
                membros, 
                localidade: localidadeSelecionada 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // 👈 PEGAMOS A MENSAGEM DO BACKEND
            throw new Error(errorData.message || 'Erro na requisição');
        }

        const data = await response.json();
        console.log('done', data);
        notifyOk();

        // Resetar todos os campos
        setNomeObj('');
        setIp('');
        setMasc('/1');
        setDesc('');
        setObs(''); // Reseta o campo de observação
        setfqdn('');
        setMembros('');
        setLocalidadeSelecionada('');
    } catch (error) {
        console.error('Erro ao enviar requisição ao backend:', error);
        toast.error(error.message || 'Houve um erro.');
    }
}

export default Form;
