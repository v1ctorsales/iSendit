import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function updateOrDeleteTask(req, res) {
    if (req.method === 'POST') {
        const { type, status, taskId } = req.body; // Adicione os parâmetros necessários para update ou delete

        try {
            if (!taskId) {
                throw new Error('ID da tarefa não fornecido ou inválido');
            }

            if (type === 'update' && status) {
                // Lógica para atualizar o status da tarefa
                const { data, error } = await supabase
                    .from('tasks')
                    .update({ status: status }) // Atualiza o status
                    .eq('id', taskId); // Filtra pelo ID da tarefa

                if (error) {
                    console.error('Erro ao atualizar a tarefa no Supabase:', error);
                    throw new Error('Erro ao atualizar a tarefa');
                }

                return res.status(200).json({ message: 'Tarefa atualizada com sucesso', task: data });
            } else if (type === 'delete') {
                // Lógica para deletar a tarefa
                const { data, error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', taskId); // Filtra pelo ID da tarefa

                if (error) {
                    console.error('Erro ao deletar a tarefa no Supabase:', error);
                    throw new Error('Erro ao deletar a tarefa');
                }

                return res.status(200).json({ message: 'Tarefa deletada com sucesso', task: data });
            } else {
                throw new Error('Tipo de operação não suportado ou status não fornecido para atualização');
            }
        } catch (error) {
            console.error('Erro no processamento da requisição:', error.message);
            return res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
