const { createClient } = require('@supabase/supabase-js');

import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendFormData(req, res) {
    if (req.method === 'POST') {
        // Recebendo os dados do corpo da requisição
        const { nomeObj, ip, masc, desc } = req.body;

        // Fazendo log dos dados recebidos
        console.log('Nome do Objeto:', nomeObj);
        console.log('IP:', ip);
        console.log('Máscara:', masc);
        console.log('Descrição:', desc);
        const formattedMasc = masc.startsWith('/') ? masc.slice(1) : masc;

        // Inserindo os dados na tabela 'tasks'
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                { autor:'victor@teste.com', nome: nomeObj, ip: ip, mascara: formattedMasc, descricao: desc }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            res.status(500).json({ message: 'Erro ao salvar dados' });
        } else {
            res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
        }
    } else {
        // Método não permitido
        res.status(405).json({ message: 'Método não permitido' });
    }
}
