import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getEmpresaInfo(req, res) {
    if (req.method === 'POST') {
        const { uuid } = req.body;

        try {
            // 1. Buscar os dados da empresa filha com base no uuid fornecido
            const { data: empresaFilha, error: errorFilha } = await supabase
                .from('empresas')
                .select('empresaPai_uuid, nome, email')
                .eq('uuid', uuid)
                .single();

            if (errorFilha || !empresaFilha) {
                console.error('Erro ao buscar dados da empresa filha:', errorFilha);
                return res.status(500).json({ message: 'Erro ao buscar dados da empresa filha' });
            }

            // 2. Se houver uma empresa pai, buscar os dados da empresa pai
            if (empresaFilha.empresaPai_uuid) {
                const { data: empresaPai, error: errorPai } = await supabase
                    .from('empresas')
                    .select('nome, email')
                    .eq('uuid', empresaFilha.empresaPai_uuid)
                    .single();

                if (errorPai || !empresaPai) {
                    console.error('Erro ao buscar dados da empresa pai:', errorPai);
                    return res.status(500).json({ message: 'Erro ao buscar dados da empresa pai' });
                }

                // 3. Retornar os dados da empresa filha junto com os dados da empresa pai
                return res.status(200).json({
                    nome: empresaFilha.nome,
                    email: empresaFilha.email,
                    parceiroNome: empresaPai.nome,
                    parceiroEmail: empresaPai.email
                });
            } else {
                // Caso não haja uma empresa pai, retornar apenas os dados da empresa filha
                return res.status(200).json({
                    nome: empresaFilha.nome,
                    email: empresaFilha.email,
                    parceiroNome: '',
                    parceiroEmail: ''
                });
            }
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
