import { formidable } from 'formidable';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Desabilita o parser padrão do Next.js (obrigatório para usar formidable)
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function importarInterfaces(req, res) {
    console.log('🔧 Nova requisição recebida:', req.method);

    if (req.method !== 'POST') {
        console.log('⚠️ Método não permitido:', req.method);
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const form = formidable();

    form.parse(req, async (err, fields, files) => {
        console.log('📥 Formulario processado:', { fields, files });

        if (err) {
            console.error('❌ Erro ao processar arquivo:', err);
            return res.status(500).json({ message: 'Erro ao processar arquivo' });
        }

        // ✅ Ajuste para pegar string pura
        const rawLocalidade = fields.localidade;
        const rawEmpresa = fields.empresa;
        const localidade = Array.isArray(rawLocalidade) ? rawLocalidade[0] : rawLocalidade;
        const empresa = Array.isArray(rawEmpresa) ? rawEmpresa[0] : rawEmpresa;

        console.log('ℹ️ Dados recebidos - Localidade:', localidade, '| Empresa:', empresa);

        if (!localidade || !empresa) {
            console.log('⚠️ Campos obrigatórios faltando.');
            return res.status(400).json({ message: 'Localidade e empresa são obrigatórios' });
        }

        const file = files.file;
        if (!file) {
            console.log('⚠️ Nenhum arquivo recebido.');
            return res.status(400).json({ message: 'Arquivo não enviado' });
        }

        try {
            console.log('📄 Lendo arquivo:', file[0].filepath);

            const content = fs.readFileSync(file[0].filepath, 'utf-8');

            console.log('✅ Arquivo lido com sucesso. Primeiros 300 caracteres:\n', content.slice(0, 300));

            // Extrair a seção "config system interface"
            const interfaceSectionRegex = /config system interface([\s\S]*?)end/;
            const match = content.match(interfaceSectionRegex);

            if (!match) {
                console.log('⚠️ Seção de interfaces não encontrada no arquivo.');
                return res.status(400).json({ message: 'Não foi possível encontrar a seção de interfaces no arquivo.' });
            }

            const sectionContent = match[1];
            console.log('✅ Seção "config system interface" extraída. Primeiros 300 caracteres:\n', sectionContent.slice(0, 300));

            // Pega todos os nomes das interfaces em: edit "NOME"
            const interfaceMatches = [...sectionContent.matchAll(/edit\s+"(.*?)"/g)];
            const interfaceNames = interfaceMatches.map(m => m[1]);

            console.log('🔍 Interfaces encontradas:', interfaceNames);

            if (interfaceNames.length === 0) {
                console.log('⚠️ Nenhuma interface encontrada.');
                return res.status(400).json({ message: 'Nenhuma interface encontrada para importar.' });
            }

            // Preparar para inserção
            const toInsert = interfaceNames.map((nome) => ({
                nome,
                localidade,
                empresa
            }));

            // 🔥 Deletar interfaces antigas antes de inserir as novas
            console.log('🗑️ Limpando interfaces antigas da empresa antes de inserir novas...');

            const { error: deleteError } = await supabase
                .from('interfaces')
                .delete()
                .eq('empresa', empresa);

            if (deleteError) {
                console.error('❌ Erro ao deletar interfaces antigas:', deleteError);
                return res.status(500).json({ message: 'Erro ao limpar interfaces antigas.' });
            }

            console.log('✅ Interfaces antigas removidas com sucesso.');
            console.log('📤 Inserindo novas interfaces:', toInsert);

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
                interfaces: interfaceNames
            });
        } catch (error) {
            console.error('❌ Erro geral:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    });
}
