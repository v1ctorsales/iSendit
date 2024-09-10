import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getTasksDestinataria(req, res) {
    if (req.method === 'POST') {
        const { uuid, taskId } = req.body;  // UUID da empresa "destinatária" e taskId opcional

        try {
            console.log('Recebido UUID da empresa destinatária:', uuid);

            if (!uuid) {
                throw new Error('UUID da empresa não fornecido ou inválido');
            }

            let tasksData, tasksError;

            if (taskId) {
                // Se taskId for fornecido, buscar a tarefa específica
                console.log('Recebido taskId:', taskId);
                ({ data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*')  // Seleciona todas as colunas para o detalhe da tarefa
                    .eq('id', taskId)  // Filtra pelo ID da tarefa específica
                    .eq('empresa_destino_uuid', uuid)  // Filtra pela empresa destinatária
                    .single());  // Espera um único resultado
            } else {
                // Caso contrário, buscar as últimas 10 tarefas recebidas
                ({ data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('id, created_at, type, nome, localidade, descricao, observacao')  // Seleciona as colunas desejadas
                    .eq('empresa_destino_uuid', uuid)  // Filtra pela empresa destinatária
                    .order('created_at', { ascending: false })  // Ordena por data de criação
                    .limit(10));  // Limita a 10 resultados
            }

            if (tasksError) {
                console.error('Erro ao buscar tarefas:', tasksError);
                throw new Error('Erro ao buscar tarefas');
            }

            if (!tasksData || (Array.isArray(tasksData) && tasksData.length === 0)) {
                console.log('Nenhuma tarefa encontrada.');
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada para o UUID fornecido' });
            }

            return res.status(200).json(taskId ? { task: tasksData } : { tasks: tasksData });
        } catch (error) {
            console.error('Erro no processamento da requisição:', error.message);
            return res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
