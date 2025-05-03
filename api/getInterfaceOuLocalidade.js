import { formidable } from 'formidable';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function getInterfaceOuLocalidade(req, res) {
    if (req.method === 'POST') {
        const form = formidable();

        form.parse(req, async (err, fields, files) => {
            const action = Array.isArray(fields.action) ? fields.action[0] : fields.action;
            if (action !== 'import') {
                console.error('Ação inválida ou não especificada no POST');
                return res.status(400).json({ message: 'Ação inválida ou não especificada' });
            }

            if (err) {
                console.error('❌ Erro ao processar arquivo:', err);
                return res.status(500).json({ message: 'Erro ao processar arquivo' });
            }

            const rawLocalidade = fields.localidade;
            const rawEmpresa = fields.empresa;
            const localidade = Array.isArray(rawLocalidade) ? rawLocalidade[0] : rawLocalidade;
            const empresa = Array.isArray(rawEmpresa) ? rawEmpresa[0] : rawEmpresa;

            console.log('ℹ️ Dados recebidos - Localidade:', localidade, '| Empresa:', empresa);

            const file = files.file;
            if (!file) {
                console.log('⚠️ Nenhum arquivo recebido.');
                return res.status(400).json({ message: 'Arquivo não enviado' });
            }

            try {
                const content = fs.readFileSync(file[0].filepath, 'utf-8')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n'); 
                console.log('✅ Arquivo lido com sucesso. Primeiros 300 caracteres:\n', content.slice(0, 300));

                // 1️⃣ Pegando zonas + interfaces
                const zoneSectionRegex = /config system zone([\s\S]*?)end/;
                const zoneMatch = content.match(zoneSectionRegex);
                const zones = [];
                const interfacesToExclude = [];

                if (zoneMatch) {
                    const zoneContent = zoneMatch[1];
                    console.log('✅ Seção "config system zone" encontrada.');

                    const zoneNames = [...zoneContent.matchAll(/edit\s+"(.*?)"/g)].map(m => m[1]);
                    console.log('🌐 Zonas encontradas:', zoneNames);
                    zones.push(...zoneNames);

                    const setInterfaceMatches = [...zoneContent.matchAll(/set interface ([^\n]*)/g)];
                    setInterfaceMatches.forEach(match => {
                        const interfaces = match[1]
                            .split('"')
                            .filter((v, i) => i % 2 !== 0);  // Só valores dentro das aspas
                        interfacesToExclude.push(...interfaces);
                    });

                    console.log('🚫 Interfaces que NÃO serão importadas (usadas nas zonas):', interfacesToExclude);
                } else {
                    console.log('⚠️ Nenhuma seção de zonas encontrada.');
                }

                // 2️⃣ Pegando interfaces do config system interface
                const interfaceSectionRegex = /config system interface([\s\S]*?)end/;
                const interfaceMatch = content.match(interfaceSectionRegex);

                const interfaceNames = [];
                if (interfaceMatch) {
                    const sectionContent = interfaceMatch[1];
                    console.log('✅ Seção "config system interface" extraída.');

                    const editBlocks = [...sectionContent.matchAll(/edit\s+"(.*?)"([\s\S]*?)next/g)];

                    editBlocks.forEach(match => {
                        const interfaceName = match[1];
                        const blockContent = match[2];

                        const aliasMatch = blockContent.match(/set\s+alias\s+"([^"]+)"/i);

                        let finalName = interfaceName;
                        if (aliasMatch) {
                            const alias = aliasMatch[1];
                            finalName = `${interfaceName} (alias: ${alias})`;
                        }

                        if (!interfacesToExclude.includes(interfaceName)) {
                            interfaceNames.push(finalName);
                        }
                    });

                    console.log('🔍 Interfaces encontradas (filtradas + aliases):', interfaceNames);
                } else {
                    console.log('⚠️ Seção de interfaces não encontrada.');
                }

                // 3️⃣ Pegando objetos (address + addrgrp)
                const objetos = [];

                // 🔎 firewall address
                const addressSectionRegex = /config firewall address([\s\S]*?)\nend\s*(?:\n|$)/;
                const addressMatch = content.match(addressSectionRegex);

                if (addressMatch) {
                    const addressContent = addressMatch[1];

                    const editBlocks = [...addressContent.matchAll(/edit\s+"([^"]+)"([\s\S]*?)\s*next/g)];
                    editBlocks.forEach(match => {
                        const nome = match[1];
                        const blockContent = match[2];

                        console.log(`🔎 Objeto: ${nome} | Conteúdo:`, blockContent.trim());  // <-- NOVO DEBUG

                        console.log('⚠️ BLOCO COMPLETO DO OBJETO:', JSON.stringify(blockContent));

                        // Captura todos os 'set ...' dentro do bloco e cria um map
                        const setLines = [...blockContent.matchAll(/set\s+([^\s]+)\s+([^\n]+)/g)];
                        const params = {};
                        setLines.forEach(match => {
                            const key = match[1].toLowerCase(); // exemplo: subnet, start-ip, end-ip
                            const value = match[2].trim();
                            params[key] = value;
                        });
                        
                        let info = null;
                        if (params['subnet']) {
                            info = `set subnet ${params['subnet']}`;
                        } else if (params['start-ip']) {
                            info = `set start-ip ${params['start-ip']}`;
                            if (params['end-ip']) {
                                info += ` set end-ip ${params['end-ip']}`;
                            }
                        } else if (params['macaddr']) {
                            info = `set macaddr ${params['macaddr']}`;
                        } else if (params['fqdn']) {
                            info = `set fqdn ${params['fqdn']}`;
                        }
                        

                        objetos.push({
                            nome,
                            tipo: 'origem/destino',
                            info,
                            localidade,
                            empresa,
                        });
                    });
                    console.log('✅ Objetos (address) encontrados:', objetos.length);
                } else {
                    console.log('⚠️ Seção "config firewall address" não encontrada.');
                }

                // 🔎 firewall addrgrp
                const addrgrpSectionRegex = /config firewall addrgrp([\s\S]*?)end/;
                const addrgrpMatch = content.match(addrgrpSectionRegex);

                if (addrgrpMatch) {
                    const addrgrpContent = addrgrpMatch[1];

                    const editBlocks = [...addrgrpContent.matchAll(/edit\s+"(.*?)"/g)];
                    editBlocks.forEach(match => {
                        const nome = match[1];
                        objetos.push({
                            nome,
                            tipo: 'origem/destino',
                            info: null,
                            localidade,
                            empresa,
                        });
                    });
                    console.log('✅ Objetos (addrgrp) encontrados:', objetos.length);
                } else {
                    console.log('⚠️ Seção "config firewall addrgrp" não encontrada.');
                }

                // 🚨 Nenhum dado encontrado?
                if (zones.length === 0 && interfaceNames.length === 0 && objetos.length === 0) {
                    console.log('⚠️ Nenhum dado encontrado para importar.');
                    return res.status(400).json({ message: 'Nenhum dado encontrado para importar.' });
                }

                // 🔄 Preparar inserção de interfaces
                const toInsertInterfaces = [];
                zones.forEach(nome => {
                    toInsertInterfaces.push({ nome, localidade, empresa });
                });
                interfaceNames.forEach(nome => {
                    toInsertInterfaces.push({ nome, localidade, empresa });
                });
                console.log('📦 Interfaces preparadas para importação:', toInsertInterfaces);

                // 🗑️ Limpar interfaces antigas
                console.log('🗑️ Limpando interfaces antigas...');
                const { error: deleteInterfacesError } = await supabase
                    .from('interfaces')
                    .delete()
                    .eq('empresa', empresa)
                    .eq('localidade', localidade);

                if (deleteInterfacesError) {
                    console.error('❌ Erro ao deletar interfaces antigas:', deleteInterfacesError);
                    return res.status(500).json({ message: 'Erro ao limpar interfaces antigas.' });
                }
                console.log('✅ Interfaces antigas removidas.');

                // 🗑️ Limpar objetos antigos
                console.log('🗑️ Limpando objetos antigos...');
                const { error: deleteObjetosError } = await supabase
                    .from('objetos')
                    .delete()
                    .eq('empresa', empresa)
                    .eq('localidade', localidade);

                if (deleteObjetosError) {
                    console.error('❌ Erro ao deletar objetos antigos:', deleteObjetosError);
                    return res.status(500).json({ message: 'Erro ao limpar objetos antigos.' });
                }
                console.log('✅ Objetos antigos removidos.');

                // 🚀 Inserir interfaces
                if (toInsertInterfaces.length > 0) {
                    console.log('🚀 Inserindo novas interfaces...');
                    const { error: insertInterfacesError } = await supabase
                        .from('interfaces')
                        .insert(toInsertInterfaces);

                    if (insertInterfacesError) {
                        console.error('❌ Erro ao inserir interfaces:', insertInterfacesError);
                        return res.status(500).json({ message: 'Erro ao salvar interfaces.' });
                    }
                    console.log('✅ Interfaces inseridas com sucesso.');
                }

                // 🚀 Inserir objetos
                if (objetos.length > 0) {
                    console.log('🚀 Inserindo novos objetos...');
                    const { error: insertObjetosError } = await supabase
                        .from('objetos')
                        .insert(objetos);

                    if (insertObjetosError) {
                        console.error('❌ Erro ao inserir objetos:', insertObjetosError);
                        return res.status(500).json({ message: 'Erro ao salvar objetos.' });
                    }
                    console.log('✅ Objetos inseridos com sucesso.');
                }

                return res.status(200).json({
                    success: true,
                    message: 'Interfaces e objetos importados com sucesso.',
                    interfaces: toInsertInterfaces.map(i => i.nome),
                    objetos: objetos.map(o => o.nome),
                });

            } catch (error) {
                console.error('❌ Erro geral:', error);
                return res.status(500).json({ message: 'Erro interno do servidor.' });
            }
        });
    }

    // 🚩 Mantém o GET igual ao anterior
    else if (req.method === 'GET') {
        const { type, localidade, empresa } = req.query;

        if (!type) {
            console.error('Tipo de consulta não especificado');
            return res.status(400).json({ message: 'Tipo de consulta não especificado' });
        }

        if (!empresa) {
            console.error('UUID da empresa não especificado');
            return res.status(400).json({ message: 'UUID da empresa não especificado' });
        }

        try {
            let data, error;
            if (type === 'interfaces') {
                console.log(`Buscando interfaces para localidade: ${localidade} e empresa: ${empresa}`);
                if (!localidade) {
                    console.error('Localidade não especificada');
                    return res.status(400).json({ message: 'Localidade não especificada' });
                }
                ({ data, error } = await supabase
                    .from('interfaces')
                    .select('nome, created_at')
                    .eq('localidade', localidade)
                    .eq('empresa', empresa));
            } else if (type === 'localidades') {
                ({ data, error } = await supabase
                    .from('localidades')
                    .select('nome')
                    .eq('empresa', empresa));
            } else {
                console.error('Tipo de consulta inválido');
                return res.status(400).json({ message: 'Tipo de consulta inválido' });
            }

            if (error) {
                console.error(`Erro ao buscar dados em ${type}:`, error);
                return res.status(500).json({ message: `Erro ao buscar dados em ${type}` });
            }

            return res.status(200).json(data);
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
