import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getTasks(req, res) {
    if (req.method === 'POST') {
        const { uuid, taskId } = req.body;  // Adicione taskId no corpo da requisição, caso seja necessário

        try {
            console.log('Recebido UUID:', uuid);

            if (!uuid) {
                throw new Error('UUID não fornecido ou inválido');
            }

            let data, error;

            if (taskId) {
                // Se taskId for fornecido, buscar detalhes da tarefa específica
                console.log('Recebido taskId:', taskId);
                ({ data, error } = await supabase
                    .from('tasks')
                    .select('*')  // Selecionar todas as colunas para detalhes da tarefa
                    .eq('id', taskId)  // Usar o taskId para buscar a tarefa específica
                    .eq('empresa_origem_uuid', uuid)
                    .single());
            } else {
                // Caso contrário, buscar as últimas 10 tarefas
                ({ data, error } = await supabase
                    .from('tasks')
                    .select('id, created_at, type, nome, localidade') // Adiciona 'id' à seleção para identificação única
                    .eq('empresa_origem_uuid', uuid)
                    .order('created_at', { ascending: false })
                    .limit(10));
            }

            if (error) {
                console.error('Erro ao buscar tarefas do Supabase:', error);
                throw new Error('Erro ao buscar tarefas do Supabase');
            }

            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('Nenhuma tarefa encontrada para este UUID.');
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada' });
            }

            return res.status(200).json(taskId ? { task: data } : { tasks: data });
        } catch (error) {
            console.error('Erro no processamento da requisição:', error.message);
            return res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
