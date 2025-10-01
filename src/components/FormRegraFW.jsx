import React, { useState, useEffect, useContext } from "react";
import fwimg from "../img/fire.gif";
import BtnSubmit from "./Botoes/BtnSubmit";
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { AuthContext } from "../contexts/AuthContext";
import { Autocomplete, TextField, Chip, Tooltip } from '@mui/material';

const notify = () => toast.error("Houve um erro.");
const notifyOk = () => toast.success("Regra de Firewall enviada!");

function FormRegraFW() {
    const [nomeRegra, setNomeRegra] = useState('');
    const [porta, setPorta] = useState('');
    const [nat, setNat] = useState('disable'); // Novo estado para NAT
    const [interfaceOrigem, setInterfaceOrigem] = useState('');
    const [interfaceDestino, setInterfaceDestino] = useState('');
    const [objetoorigem, setObjetoorigem] = useState('');
    const [objetouser, setObjetoUser] = useState('');
    const [objetogrupo, setObjetoGrupo] = useState('');
    const [objetodestino, setObjetodestino] = useState('');
    const [desc, setDesc] = useState('');
    const [action, setAction] = useState('accept');
    const [localidade, setLocalidade] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isLoading, setLoading] = useState(false); 
    const [localidades, setLocalidades] = useState([]);
    const [interfaces, setInterfaces] = useState([]); 
    const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(true); 
    const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false); 
    const [obs, setObs] = useState(''); 
    const [objetosOrigemSelecionados, setObjetosOrigemSelecionados] = useState([]);
    const [objetosDestinoSelecionados, setObjetosDestinoSelecionados] = useState([]);
    const [objetos, setObjetos] = useState([]);
const [isLoadingObjetos, setIsLoadingObjetos] = useState(false);
const [objetosOrigemInput, setObjetosOrigemInput] = useState('');
const [objetosDestinoInput, setObjetosDestinoInput] = useState('');
const norm = (item) => (typeof item === 'string' ? item : item.nome);
const [usersSelecionados, setUsersSelecionados] = useState([]);
const [usersInput, setUsersInput] = useState('');
const [gruposSelecionados, setGruposSelecionados] = useState([]);
const [gruposInput, setGruposInput] = useState('');
const [portasSelecionadas, setPortasSelecionadas] = useState([]);
const [portasInput, setPortasInput] = useState('');

const chipifyInput = (input, selected, setSelected) => {
  const tokens = input.split(',').map(t => t.trim()).filter(Boolean);
  if (!tokens.length) return;
  const existing = new Set(selected.map(norm));
  const newOnes = tokens.filter(t => !existing.has(t));
  if (newOnes.length) setSelected([...selected, ...newOnes]);
};

// chipifica texto comum (vírgula/Enter), deduplica
const chipifyInputGeneric = (input, selected, setSelected, mapFn = (x) => x) => {
  const tokens = input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(mapFn);
  if (!tokens.length) return;
  const existing = new Set(selected.map(String));
  const novos = tokens.filter(t => !existing.has(String(t)));
  if (novos.length) setSelected([...selected, ...novos]);
};

// chipify específico para portas: sempre UPPERCASE
const chipifyPortas = (input, selected, setSelected) =>
  chipifyInputGeneric(input, selected, setSelected, (t) => t.toUpperCase());




    const { uuid, empresaPai  } = useContext(AuthContext);
    const { isAuthenticated, destinataria } = useContext(AuthContext); 
    const empresaId = destinataria ? uuid : empresaPai;

    useEffect(() => {
        if (uuid && destinataria !== undefined) {
            console.log('UUID from UuidContext:', uuid); 
        }
    }, [uuid, destinataria]);
    
    const isButtonDisabled = () => {
        const origemVazia = objetosOrigemSelecionados.length === 0 && !objetosOrigemInput.trim();
  const destinoVazio = objetosDestinoSelecionados.length === 0 && !objetosDestinoInput.trim();
        return isSubmitting 
        || !nomeRegra.trim() 
        || (portasSelecionadas.length === 0 && !portasInput.trim())
        || !interfaceOrigem.trim() 
        || !interfaceDestino.trim() 
        || origemVazia
        || destinoVazio
        || !action.trim() 
        || !localidade.trim();
    
    };

    useEffect(() => {
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
    
        if (empresaId) {
            fetchLocalidades();
        }
    }, [empresaId]);
    

    useEffect(() => {
        if (localidade && localidade !== 'default') {
            const fetchInterfaces = async () => {
                try {
                    setIsLoadingInterfaces(true);
                    console.log(localidade, uuid);
    
                    const response = await fetch(`/api/getInterfaceOuLocalidade?type=interfaces&localidade=${localidade}&empresa=${empresaId}`);
                    if (!response.ok) {
                        throw new Error('Erro ao buscar interfaces');
                    }
                    const data = await response.json();
                    const interfacesExtras = [{ nome: "any" }, { nome: "virtual-wan-link" }];
const interfacesComExtras = [...interfacesExtras, ...data];
setInterfaces(interfacesComExtras);
                } catch (err) {
                    console.error('Erro ao carregar interfaces:', err);
                    notify();
                } finally {
                    setIsLoadingInterfaces(false);
                }
            };
    
            const fetchObjetos = async () => {
                try {
                    setIsLoadingObjetos(true);
                    console.log(`Buscando objetos para localidade: ${localidade} e empresa: ${empresaId}`);
    
                    const response = await fetch(`/api/handleObjects?empresa=${empresaId}&localidade=${localidade}`);
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
    
            if (empresaId) {
                fetchInterfaces();
                fetchObjetos();  // 👈 CHAMANDO OS OBJETOS TAMBÉM
            }
        }
    }, [localidade, empresaId]);
    
    
    

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true);
  

const origemList = [
  ...objetosOrigemSelecionados.map(norm),
  ...(objetosOrigemInput.trim() ? [objetosOrigemInput.trim()] : []),
];

const destinoList = [
  ...objetosDestinoSelecionados.map(norm),
  ...(objetosDestinoInput.trim() ? [objetosDestinoInput.trim()] : []),
];

// users/grupos/portas vindos dos chips + input atual
const usersList = [
  ...usersSelecionados,
  ...(usersInput.trim() ? [usersInput.trim()] : []),
];

const gruposList = [
  ...gruposSelecionados,
  ...(gruposInput.trim() ? [gruposInput.trim()] : []),
];

const portasList = [
  ...portasSelecionadas,
  ...(portasInput.trim() ? [portasInput.trim().toUpperCase()] : []),
];

// porta final (já em UPPERCASE quando for o caso)
const portaUppercase = portasList.join(',');

    
        sendFormDataComponent({
            uuid,
            empresaPai,
            regrafw: "regrafw",
            nomeRegra,
            porta: portaUppercase, // Enviar o valor como uppercase
            interfaceOrigem,
            interfaceDestino,
// ao enviar:
objetoorigem: origemList.join(','),
objetodestino: destinoList.join(','),
            objetouser: usersList.join(','),
            objetogrupo: gruposList.join(','),
            desc,
            obs,
            action,
            localidade,
            nat, // Adicionar o campo NAT aqui
            status: "aberto"
        })
        .then(() => {
            // Resetar os campos após o envio
            setNomeRegra('');
            setPorta('');
            setInterfaceOrigem('');
            setInterfaceDestino('');
            setObjetosOrigemSelecionados([]);
            setObjetoUser('');
            setObjetoGrupo('');
            setObjetosDestinoSelecionados([]);
            setObjetosOrigemInput('');
            setUsersSelecionados([]); setUsersInput('');
            setGruposSelecionados([]); setGruposInput('');
            setPortasSelecionadas([]); setPortasInput('');
            setObjetosDestinoInput('');
            setDesc('');
            setAction('accept');
            //setLocalidade('');
            setNat('disable'); // Resetar o valor de NAT
            setObs('');
            notifyOk();
        })
        .catch((error) => {
            console.error('Erro ao enviar requisição ao backend:', error);
            notify();
        })
        .finally(() => {
            setIsSubmitting(false);
            setLoading(false);
        });
    };
    
    

    return (
        <>
            <div className="topForm">
                <div className="h2Obj">
                    <h2>Envio de Regras de Firewall</h2>
                    <img className="fireImg" src={fwimg} alt="Cube" />
                </div>          
            </div>
            <div className="choiceObjeto">
                <button className={`btn-choice btn-active`}>Regras de Firewall</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={`formPai ${isLoadingLocalidades ? 'off' : ''}`} id="form_regrasfw">
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
      options={localidades.map((l) => l.nome)}
      value={localidade}
      onChange={(_, value) => setLocalidade(value || '')}
      disableClearable
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Selecione uma localidade"
        />
      )}
      ListboxProps={{
        sx: {
          fontSize: '0.8em'
        }
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


                    <div className="formDiv">
                        <div className="divson" htmlFor="nomeRegra">Nome</div>
                        <input 
                            type="text" 
                            id="nomeRegra" 
                            value={nomeRegra} 
                            onChange={(e) => setNomeRegra(e.target.value)} 
                        />
                    </div>
                   
                    <h4>Interfaces</h4>
                    {isLoadingInterfaces ? (
                        <div className="centerDois">
                            <AiOutlineLoading3Quarters className="loading-icon" />
                        </div>
                    ) : (
                        <>
{/* Interface Origem */}
<div className="formDiv">
  <div className="divson" htmlFor="interfaceorigem">Origem</div>
  <Autocomplete
  id="interfaceorigem"
  options={interfaces.map(i => i.nome)}
  getOptionLabel={opt => {
    const m = opt.match(/^(.*?)\s*\(alias: (.*)\)$/);
    return m ? m[1] : opt;
  }}
  renderOption={(props, opt) => {
    const m     = opt.match(/^(.*?)\s*\(alias: (.*)\)$/);
    const name  = m ? m[1] : opt;
    const alias = m ? m[2] : '';
    return (
      <Tooltip title={alias} placement="right">
        <li {...props} style={{ fontSize: '1em', lineHeight: 1.5 }}>
          {name}
          {alias && (
            <span style={{ color: 'black', marginLeft: 4 }}>*</span>
          )}
        </li>
      </Tooltip>
    );
  }}
  renderInput={params => {
    const raw = params.inputProps.value || '';
    const hasAlias = /\(alias:/.test(raw);
    const display = hasAlias
      ? raw.replace(/\s*\(alias:.*\)$/, '')
      : raw;
    return (
      <TextField
        {...params}
        variant="outlined"
        placeholder="Selecione uma origem"
        value={display}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {hasAlias && (
                <span style={{ color: 'black', marginRight: 8 }}>*</span>
              )}
              {params.InputProps.endAdornment}
            </>
          )
        }}
        size="small"
        fullWidth
      />
    );
  }}
  value={interfaceOrigem}
  onChange={(_, v) => setInterfaceOrigem(v || '')}
  disableClearable
  ListboxProps={{ sx: { fontSize: '0.8em' } }}
  sx={{
    width: 490,
    '& .MuiInputBase-root': { fontSize: '0.8em', p: '4px !important' },
    '& .MuiAutocomplete-endAdornment': {
      right: 10, top: '50%', transform: 'translateY(-50%)'
    },
  }}
/>
</div>

{/* Interface Destino */}
<div className="formDiv">
  <div className="divson" htmlFor="interfacedestino">Destino</div>
  {/* Interface Destino */}
  <Autocomplete
  id="interfacedestino"
  options={interfaces.map(i => i.nome)}
  getOptionLabel={opt => {
    const m = opt.match(/^(.*?)\s*\(alias: (.*)\)$/);
    return m ? m[1] : opt;
  }}
  renderOption={(props, opt) => {
    const m     = opt.match(/^(.*?)\s*\(alias: (.*)\)$/);
    const name  = m ? m[1] : opt;
    const alias = m ? m[2] : '';
    return (
      <Tooltip title={alias} placement="right">
        <li {...props} style={{ fontSize: '1em', lineHeight: 1.5 }}>
          {name}
          {alias && (
            <span style={{ color: 'black', marginLeft: 4 }}>*</span>
          )}
        </li>
      </Tooltip>
    );
  }}
  renderInput={params => {
    const raw = params.inputProps.value || '';
    const hasAlias = /\(alias:/.test(raw);
    const display = hasAlias
      ? raw.replace(/\s*\(alias:.*\)$/, '')
      : raw;
    return (
      <TextField
        {...params}
        variant="outlined"
        placeholder="Selecione um destino"
        value={display}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {hasAlias && (
                <span style={{ color: 'black', marginRight: 8 }}>*</span>
              )}
              {params.InputProps.endAdornment}
            </>
          )
        }}
        size="small"
        fullWidth
      />
    );
  }}
  value={interfaceDestino}
  onChange={(_, v) => setInterfaceDestino(v || '')}
  disableClearable
  ListboxProps={{ sx: { fontSize: '0.8em' } }}
  sx={{
    width: 490,
    '& .MuiInputBase-root': { fontSize: '0.8em', p: '4px !important' },
    '& .MuiAutocomplete-endAdornment': {
      right: 10, top: '50%', transform: 'translateY(-50%)'
    },
  }}
/>
</div>

                        </>
                    )}

                    <h4>Objetos</h4>
                    <div className="formDiv">
    <div className="divson" htmlFor="objetoorigem">Origem</div>
<Autocomplete
  multiple
  freeSolo
  id="objetoorigem"
  options={objetos} // [{ nome, info }]
  getOptionLabel={(option) => typeof option === 'string' ? option : option.nome}
  renderOption={(props, option) => (
    <Tooltip title={(option.info || '')} placement="right">
      <li {...props} style={{ fontSize: '1em', lineHeight: 1.5 }}>
        {typeof option === 'string' ? option : option.nome}
      </li>
    </Tooltip>
  )}
  value={objetosOrigemSelecionados}
  onChange={(_, newValue) => {
    // aceita strings e objetos
    setObjetosOrigemSelecionados(newValue);
  }}
  inputValue={objetosOrigemInput}
  onInputChange={(_, newInput) => setObjetosOrigemInput(newInput)}
  clearOnBlur={false}          // mantém o texto ao perder foco
  selectOnFocus={false}
  handleHomeEndKeys
  filterSelectedOptions
renderTags={(value, getTagProps) =>
  value.map((option, idx) => {
    const label = typeof option === 'string' ? option : option.nome;
    return (
      <Chip
        key={label}
        label={label}
        size="small"
        {...getTagProps({ index: idx })} // garante o "X"
        sx={{
          fontSize: '0.75em',
          maxWidth: '160px',
          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          bgcolor: '#ffe3ef',
          color: '#d81b60',
          border: '1px solid #f48fb1',
        }}
      />
    );
  })
}
renderInput={(params) => (
  <TextField
    {...params}
    variant="outlined"
    placeholder="Selecione ou digite objetos de origem"
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        chipifyInput(objetosOrigemInput, objetosOrigemSelecionados, setObjetosOrigemSelecionados);
        setObjetosOrigemInput('');
      }
    }}
    onBlur={() => {
      // opcional: chipifica ao sair do campo
      if (objetosOrigemInput.trim()) {
        chipifyInput(objetosOrigemInput, objetosOrigemSelecionados, setObjetosOrigemSelecionados);
        setObjetosOrigemInput('');
      }
    }}
  />
)}

  ListboxProps={{ sx: { fontSize: '0.8em' } }}
  sx={{
    width: 490,
    '& .MuiInputBase-root': { fontSize: '0.8em', padding: '4px !important' },
    '& .MuiAutocomplete-endAdornment': { right: 10, top: '50%', transform: 'translateY(-50%)' }
  }}
/>




</div>

                  <div className="formDiv">
                      <div className="divson" htmlFor="objetouser">User(s)</div>
                      <Autocomplete
                        multiple
                        freeSolo
                        id="objetouser"
                        options={[]} // sem opções pré-carregadas (livre)
                        value={usersSelecionados}
                        onChange={(_, newValue) => setUsersSelecionados(newValue)}
                        inputValue={usersInput}
                        onInputChange={(_, v) => setUsersInput(v)}
                        clearOnBlur={false}
                        filterSelectedOptions
                        renderTags={(value, getTagProps) =>
                          value.map((label, idx) => (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              {...getTagProps({ index: idx })}
                              sx={{
                                fontSize: '0.75em',
                                maxWidth: '160px',
                                '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                                bgcolor: '#ffe3ef', color: '#d81b60', border: '1px solid #f48fb1',
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="it.admin, user.vpn, cloud.admin"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                chipifyInputGeneric(usersInput, usersSelecionados, setUsersSelecionados);
                                setUsersInput('');
                              }
                            }}
                            onBlur={() => {
                              if (usersInput.trim()) {
                                chipifyInputGeneric(usersInput, usersSelecionados, setUsersSelecionados);
                                setUsersInput('');
                              }
                            }}
                          />
                        )}
                        ListboxProps={{ sx: { fontSize: '0.8em' } }}
                        sx={{
                          width: 490,
                          '& .MuiInputBase-root': { fontSize: '0.8em', padding: '4px !important' },
                          '& .MuiAutocomplete-endAdornment': { right: 10, top: '50%', transform: 'translateY(-50%)' },
                        }}
                      />
                    </div>


<div className="formDiv">
  <div className="divson" htmlFor="objetogrupo">Grupo(s)</div>
  <Autocomplete
    multiple
    freeSolo
    id="objetogrupo"
    options={[]}
    value={gruposSelecionados}
    onChange={(_, newValue) => setGruposSelecionados(newValue)}
    inputValue={gruposInput}
    onInputChange={(_, v) => setGruposInput(v)}
    clearOnBlur={false}
    filterSelectedOptions
    renderTags={(value, getTagProps) =>
      value.map((label, idx) => (
        <Chip
          key={label}
          label={label}
          size="small"
          {...getTagProps({ index: idx })}
          sx={{
            fontSize: '0.75em',
            maxWidth: '160px',
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
            bgcolor: '#ffe3ef', color: '#d81b60', border: '1px solid #f48fb1',
          }}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        placeholder="ADM, IT, Dev"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            chipifyInputGeneric(gruposInput, gruposSelecionados, setGruposSelecionados);
            setGruposInput('');
          }
        }}
        onBlur={() => {
          if (gruposInput.trim()) {
            chipifyInputGeneric(gruposInput, gruposSelecionados, setGruposSelecionados);
            setGruposInput('');
          }
        }}
      />
    )}
    ListboxProps={{ sx: { fontSize: '0.8em' } }}
    sx={{
      width: 490,
      '& .MuiInputBase-root': { fontSize: '0.8em', padding: '4px !important' },
      '& .MuiAutocomplete-endAdornment': { right: 10, top: '50%', transform: 'translateY(-50%)' },
    }}
  />
</div>

                    <div className="formDiv">
    <div className="divson" htmlFor="objetodestino">Destino</div>
<Autocomplete
  multiple
  freeSolo
  id="objetodestino"
  options={objetos
    .filter(obj => !(obj.info && obj.info.toLowerCase().includes('set macaddr')))}
  getOptionLabel={(option) => typeof option === 'string' ? option : option.nome}
  renderOption={(props, option) => (
    <Tooltip title={(typeof option === 'string' ? '' : (option.info || ''))} placement="right">
      <li {...props} style={{ fontSize: '1em', lineHeight: 1.5 }}>
        {typeof option === 'string' ? option : option.nome}
      </li>
    </Tooltip>
  )}
  value={objetosDestinoSelecionados}
  onChange={(_, newValue) => setObjetosDestinoSelecionados(newValue)}
  inputValue={objetosDestinoInput}
  onInputChange={(_, newInput) => setObjetosDestinoInput(newInput)}
  clearOnBlur={false}
  selectOnFocus={false}
  handleHomeEndKeys
  filterSelectedOptions
renderTags={(value, getTagProps) =>
  value.map((option, idx) => {
    const label = typeof option === 'string' ? option : option.nome;
    return (
      <Chip
        key={label}
        label={label}
        size="small"
        {...getTagProps({ index: idx })} // garante o "X"
        sx={{
          fontSize: '0.75em',
          maxWidth: '160px',
          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          bgcolor: '#ffe3ef',
          color: '#d81b60',
          border: '1px solid #f48fb1',
        }}
      />
    );
  })
}
renderInput={(params) => (
  <TextField
    {...params}
    variant="outlined"
    placeholder="Selecione ou digite objetos de destino"
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        chipifyInput(
          objetosDestinoInput,
          objetosDestinoSelecionados,
          setObjetosDestinoSelecionados
        );
        setObjetosDestinoInput('');
      }
    }}
    onBlur={() => {
      if (objetosDestinoInput.trim()) {
        chipifyInput(
          objetosDestinoInput,
          objetosDestinoSelecionados,
          setObjetosDestinoSelecionados
        );
        setObjetosDestinoInput('');
      }
    }}
  />
)}

  ListboxProps={{ sx: { fontSize: '0.8em' } }}
  sx={{
    width: 490,
    '& .MuiInputBase-root': { fontSize: '0.8em', padding: '4px !important' },
    '& .MuiAutocomplete-endAdornment': { right: 10, top: '50%', transform: 'translateY(-50%)' }
  }}
/>




</div>


<div className="formDiv">
  <div className="divson" htmlFor="porta">Porta(s)</div>
  <Autocomplete
    multiple
    freeSolo
    id="porta"
    options={[]} // livre
    value={portasSelecionadas}
    onChange={(_, newValue) => {
      // sempre uppercase ao receber seleção/string
      const norm = newValue.map(v => (typeof v === 'string' ? v : String(v))).map(s => s.toUpperCase());
      // dedup
      setPortasSelecionadas(Array.from(new Set(norm)));
    }}
    inputValue={portasInput}
    onInputChange={(_, v) => setPortasInput(v)}
    clearOnBlur={false}
    filterSelectedOptions
    renderTags={(value, getTagProps) =>
      value.map((label, idx) => (
        <Chip
          key={label}
          label={label}
          size="small"
          {...getTagProps({ index: idx })}
          sx={{
            fontSize: '0.75em',
            maxWidth: '160px',
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
            bgcolor: '#ffe3ef', color: '#d81b60', border: '1px solid #f48fb1',
          }}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        placeholder="ALL, HTTPS, 3389"
        className="portadivmargtop"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            chipifyPortas(portasInput, portasSelecionadas, setPortasSelecionadas);
            setPortasInput('');
          }
        }}
        onBlur={() => {
          if (portasInput.trim()) {
            chipifyPortas(portasInput, portasSelecionadas, setPortasSelecionadas);
            setPortasInput('');
          }
        }}
      />
    )}
    ListboxProps={{ sx: { fontSize: '0.8em' } }}
    sx={{
      width: 490,
      '& .MuiInputBase-root': { fontSize: '0.8em', padding: '4px !important' },
      '& .MuiAutocomplete-endAdornment': { right: 10, top: '50%', transform: 'translateY(-50%)' },
    }}
  />
</div>

                    
{/* NAT */}
<div className="formDiv">
  <div className="divson" htmlFor="nat">NAT</div>
  <Autocomplete
    id="nat"
    options={[
      { label: 'Desativado', value: 'disable' },
      { label: 'Ativado', value: 'enable' }
    ]}
    getOptionLabel={(opt) => opt.label}
    value={(() => {
      const sel = [{ label: 'Desativado', value: 'disable' }, { label: 'Ativado', value: 'enable' }]
        .find(o => o.value === nat);
      return sel || null;
    })()}
    onChange={(_, newOpt) => setNat(newOpt?.value || 'disable')}
    disableClearable
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        placeholder="NAT"
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
</div>

{/* Ação */}
<div className="formDiv">
  <div className="divson" htmlFor="action">Ação</div>
  <Autocomplete
    id="action"
    options={[
      { label: 'Aceitar', value: 'accept' },
      { label: 'Recusar', value: 'deny' }
    ]}
    getOptionLabel={(opt) => opt.label}
    value={(() => {
      const sel = [{ label: 'Aceitar', value: 'accept' }, { label: 'Recusar', value: 'deny' }]
        .find(o => o.value === action);
      return sel || null;
    })()}
    onChange={(_, newOpt) => setAction(newOpt?.value || 'accept')}
    disableClearable
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        placeholder="Ação"
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
                        textarea/>
                </div>

                    
                    <BtnSubmit disabled={isButtonDisabled()} isLoading={isLoading} />
                </div>
            </form>
            <ToastContainer />
        </>
    );
}

function sendFormDataComponent(data) {
    return fetch('/api/sendFormFW', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json();
    });
}

export default FormRegraFW;
