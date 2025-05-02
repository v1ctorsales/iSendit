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
                const content = fs.readFileSync(file[0].filepath, 'utf-8');
                console.log('✅ Arquivo lido com sucesso. Primeiros 300 caracteres:\n', content.slice(0, 300));

                // 1️⃣ Pegando todas as zonas e interfaces dentro das zonas
                const zoneSectionRegex = /config system zone([\s\S]*?)end/;
                const zoneMatch = content.match(zoneSectionRegex);
                const zones = [];
                const interfacesToExclude = [];

                if (zoneMatch) {
                    const zoneContent = zoneMatch[1];
                    console.log('✅ Seção "config system zone" encontrada.');

                    // Extrair os nomes das zonas (edit "LAN", etc.)
                    const zoneNames = [...zoneContent.matchAll(/edit\s+"(.*?)"/g)].map(m => m[1]);
                    console.log('🌐 Zonas encontradas:', zoneNames);

                    zones.push(...zoneNames);

                    // Para cada zona, achar set interface "xxx" "yyy"
                    const setInterfaceMatches = [...zoneContent.matchAll(/set interface ([^\n]*)/g)];
                    setInterfaceMatches.forEach(match => {
                        const interfaces = match[1]
                            .split('"')
                            .filter((v, i) => i % 2 !== 0);  // Pega só os valores dentro das aspas
                        interfacesToExclude.push(...interfaces);
                    });

                    console.log('🚫 Interfaces que NÃO serão importadas (usadas nas zonas):', interfacesToExclude);
                } else {
                    console.log('⚠️ Nenhuma seção de zonas encontrada.');
                }

                // 2️⃣ Pegando todas as interfaces do config system interface
                const interfaceSectionRegex = /config system interface([\s\S]*?)end/;
                const interfaceMatch = content.match(interfaceSectionRegex);

                let interfaceNames = [];
                if (interfaceMatch) {
                    const sectionContent = interfaceMatch[1];
                    console.log('✅ Seção "config system interface" extraída.');

                    const editBlocks = [...sectionContent.matchAll(/edit\s+"(.*?)"([\s\S]*?)next/g)];

interfaceNames = [];

editBlocks.forEach(match => {
    const interfaceName = match[1];
    const blockContent = match[2];

    // Procura o alias
    const aliasMatch = blockContent.match(/set\s+alias\s+"([^"]+)"/i);


    let finalName = interfaceName;
    if (aliasMatch) {
        const alias = aliasMatch[1];
        finalName = `${interfaceName} (alias: ${alias})`;
    }

    // Só adiciona se NÃO está na lista de exclusão
    if (!interfacesToExclude.includes(interfaceName)) {
        interfaceNames.push(finalName);
    }
});

console.log('🔍 Interfaces encontradas (filtradas + aliases):', interfaceNames);

                } else {
                    console.log('⚠️ Seção de interfaces não encontrada no arquivo.');
                }

                // ⚠️ Se nenhuma interface ou zona encontrada, erro
                if (zones.length === 0 && interfaceNames.length === 0) {
                    console.log('⚠️ Nenhuma interface ou zona encontrada.');
                    return res.status(400).json({ message: 'Nenhuma interface ou zona encontrada para importar.' });
                }

                // 🔄 Inserir no Supabase
                const toInsert = [];

                zones.forEach(nome => {
                    toInsert.push({ nome, localidade, empresa });
                });

                interfaceNames.forEach(nome => {
                    toInsert.push({ nome, localidade, empresa });
                });

                console.log('📦 Preparado para importar:', toInsert);

                // Deleta as interfaces antigas da empresa e localidade antes
                console.log('🗑️ Limpando interfaces antigas da empresa/localidade antes de inserir novas...');
                const { error: deleteError } = await supabase
                    .from('interfaces')
                    .delete()
                    .eq('empresa', empresa)
                    .eq('localidade', localidade);

                if (deleteError) {
                    console.error('❌ Erro ao deletar interfaces antigas:', deleteError);
                    return res.status(500).json({ message: 'Erro ao limpar interfaces antigas.' });
                }

                console.log('✅ Interfaces antigas removidas com sucesso.');
                console.log('🚀 Inserindo novas interfaces...');

                const { error } = await supabase
                    .from('interfaces')
                    .insert(toInsert);

                if (error) {
                    console.error('❌ Erro ao inserir interfaces no Supabase:', error);
                    return res.status(500).json({ message: 'Erro ao salvar interfaces no banco de dados.' });
                }

                console.log('✅ Interfaces inseridas com sucesso.');
                return res.status(200).json({
                    success: true,
                    message: 'Interfaces importadas com sucesso.',
                    interfaces: toInsert.map(i => i.nome)
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
