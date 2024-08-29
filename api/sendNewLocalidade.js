import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendNewLocalidade(req, res) {
    if (req.method === 'POST') {
        const { nome, empresa } = req.body;

        if (!nome || !empresa) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            // Verifica se já existe uma localidade com o mesmo nome para a empresa
            const { data: existingLocalidade, error: checkError } = await supabase
                .from('localidades')
                .select('nome')
                .eq('nome', nome)
                .eq('empresa', empresa)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // Verifica se houve erro na consulta, mas ignora "no rows" (quando não encontra nenhum registro)
                console.error('Erro ao buscar localidade:', checkError);
                return res.status(500).json({ message: 'Erro ao verificar localidade' });
            }

            if (existingLocalidade) {
                return res.status(409).json({ message: 'Já existe uma localidade com este nome para a mesma empresa' });
            }

            // Insere a nova localidade se não houver duplicata
            const { data, error } = await supabase
                .from('localidades')
                .insert([{ nome, empresa }]);

            if (error) {
                console.error('Erro ao inserir localidade:', error);
                return res.status(500).json({ message: 'Erro ao inserir localidade' });
            }

            return res.status(200).json({ success: true, message: 'Localidade adicionada com sucesso' });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
