import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getTasks(req, res) {
    if (req.method === 'POST') {
        const { uuid } = req.body;

        try {
            console.log('Recebido UUID:', uuid);

            if (!uuid) {
                throw new Error('UUID não fornecido ou inválido');
            }

            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('created_at, type, nome, localidade')
                .eq('empresa_origem_uuid', uuid)  // Certifique-se de que 'empresa_origem_uuid' é o nome correto da coluna
                .order('created_at', { ascending: false })
                .limit(10);

            console.log('Tarefas retornadas:', tasks);

            if (error) {
                console.error('Erro ao buscar tarefas do Supabase:', error);
                throw new Error('Erro ao buscar tarefas do Supabase');
            }

            if (!tasks || tasks.length === 0) {
                console.log('Nenhuma tarefa encontrada para este UUID.');
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada' });
            }

            return res.status(200).json({ tasks });
        } catch (error) {
            console.error('Erro no processamento da requisição:', error.message);
            return res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
