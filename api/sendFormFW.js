import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendFormFW(req, res) {
    if (req.method === 'POST') {
        const { regrafw, nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, localidade } = req.body;

        console.log('Tipo do Form:', regrafw);
        console.log('Nome da Regra:', nomeRegra);
        console.log('Porta:', porta);
        console.log('Interface Origem:', interfaceOrigem);
        console.log('Interface Destino:', interfaceDestino);
        console.log('Objeto Origem:', objetoorigem);
        console.log('Objeto Destino:', objetodestino);
        console.log('Descrição:', desc);
        console.log('Ação:', action);
        console.log('Localidade:', localidade); // Verifica se localidade está sendo recebido

        // Verifica se localidade está presente
        if (!localidade) {
            return res.status(400).json({ message: 'Localidade é obrigatória' });
        }

        // Insere os dados na tabela 'tasks'
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    autor: 'victor@teste.com',
                    nome: nomeRegra,
                    descricao: desc,
                    type: regrafw,
                    porta,
                    interface_origem: interfaceOrigem,
                    interface_destino: interfaceDestino,
                    objeto_origem: objetoorigem,
                    objeto_destino: objetodestino,
                    acao: action === "accept" ? 1 : 0,
                    localidade // Inclui a localidade na inserção
                }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            res.status(500).json({ message: 'Erro ao salvar dados' });
        } else {
            res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
