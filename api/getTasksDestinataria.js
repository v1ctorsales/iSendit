import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getTasksDestinataria(req, res) {
    if (req.method === 'POST') {
        const { uuid } = req.body;  // UUID da empresa "destinatária"

        try {
            console.log('Recebido UUID da empresa destinatária:', uuid);

            if (!uuid) {
                throw new Error('UUID da empresa não fornecido ou inválido');
            }

            // Buscar todas as tarefas onde 'empresa_destino_uuid' seja igual ao UUID recebido
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('id, created_at, type, nome, localidade, descricao, observacao')  // Selecionar as colunas desejadas
                .eq('empresa_destino_uuid', uuid)  // Filtrar pela empresa destinatária
                .order('created_at', { ascending: false })  // Ordenar por data de criação
                .limit(10);  // Limitar a 10 resultados, mas pode ser ajustado

            if (tasksError) {
                console.error('Erro ao buscar tarefas:', tasksError);
                throw new Error('Erro ao buscar tarefas');
            }

            if (!tasksData || tasksData.length === 0) {
                console.log('Nenhuma tarefa encontrada.');
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada para o UUID fornecido' });
            }

            return res.status(200).json({ tasks: tasksData });
        } catch (error) {
            console.error('Erro no processamento da requisição:', error.message);
            return res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
