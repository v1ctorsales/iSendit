import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendFormData(req, res) {
    if (req.method === 'POST') {
        // Recebendo os dados do corpo da requisição
        const { uuid, formType, nomeObj, ip, masc, desc, fqdn, membros, localidade } = req.body;

        // Verifica se o UUID está presente
        if (!uuid) {
            console.error('UUID não fornecido ou inválido');
            return res.status(400).json({ message: 'UUID é obrigatório' });
        }

        console.log('UUID:', uuid); // Verifica se uuid está sendo recebido
        console.log('Tipo do Form:', formType);
        console.log('Nome do Objeto:', nomeObj);
        console.log('IP:', ip);
        console.log('Máscara:', masc);
        console.log('Descrição:', desc);
        console.log('Fqdn:', fqdn);
        console.log('Membros:', membros);
        console.log('Localidade:', localidade);

        // Verifica se localidade está presente
        if (!localidade) {
            return res.status(400).json({ message: 'Localidade é obrigatória' });
        }

        const formattedMasc = formType === "ip" && masc.startsWith('/') ? masc.slice(1) : null;

        // Consulta para obter os nomes da empresa filha e pai usando o UUID
        try {
            const { data: empresaFilhaData, error: empresaFilhaError } = await supabase
                .from('empresas')
                .select('nome, empresaPai_uuid')
                .eq('uuid', uuid)
                .single();

            if (empresaFilhaError) {
                console.error('Erro ao obter dados da empresa filha:', empresaFilhaError);
                return res.status(500).json({ message: 'Erro ao obter dados da empresa filha' });
            }

            const empresaNome = empresaFilhaData.nome;
            const empresaPaiUuid = empresaFilhaData.empresaPai_uuid;

            let empresaPaiNome = null;
            if (empresaPaiUuid) {
                const { data: empresaPaiData, error: empresaPaiError } = await supabase
                    .from('empresas')
                    .select('nome')
                    .eq('uuid', empresaPaiUuid)
                    .single();

                if (empresaPaiError) {
                    console.error('Erro ao obter dados da empresa pai:', empresaPaiError);
                    return res.status(500).json({ message: 'Erro ao obter dados da empresa pai' });
                }

                empresaPaiNome = empresaPaiData.nome;
            }

            // Inserindo os dados na tabela 'tasks'
            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    { 
                        autor: 'victor@teste.com', 
                        nome: nomeObj, 
                        ip: ip, 
                        mascara: formattedMasc, 
                        descricao: desc, 
                        type: formType, 
                        fqdn: fqdn, 
                        membros: membros,
                        localidade, // Inclui a localidade na inserção
                        empresa_origem: empresaNome, // Nome da empresa filha
                        empresa_destino: empresaPaiNome // Nome da empresa pai
                    }
                ]);

            if (error) {
                console.error('Erro ao inserir dados:', error);
                res.status(500).json({ message: 'Erro ao salvar dados' });
            } else {
                res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
            }
        } catch (error) {
            console.error('Erro interno do servidor:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        // Método não permitido
        res.status(405).json({ message: 'Método não permitido' });
    }
}
