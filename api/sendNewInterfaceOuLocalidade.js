import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendNewInterfaceOuLocalidade(req, res) {
    if (req.method === 'POST') {
        const { type, nome, localidade, empresa } = req.body;

        // Verifica se todos os parâmetros necessários foram fornecidos
        if (!type || !nome || !empresa || (type === 'interfaces' && !localidade)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            let data, error;
            if (type === 'localidades') {
                // Cria nova localidade vinculada à empresa
                ({ data, error } = await supabase
                    .from('localidades')
                    .insert([{ nome: nome, empresa: empresa }]));
            } else if (type === 'interfaces') {
                // Cria nova interface vinculada à localidade e empresa
                ({ data, error } = await supabase
                    .from('interfaces')
                    .insert([{ nome: nome, localidade: localidade, empresa: empresa }]));
            } else {
                return res.status(400).json({ message: 'Tipo de criação inválido' });
            }

            if (error) {
                return res.status(500).json({ message: `Erro ao criar ${type}` });
            }

            return res.status(200).json({ success: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} criada com sucesso` });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
