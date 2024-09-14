import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getEmpresaInfo(req, res) {
    if (req.method === 'POST') {
        const { uuid, destinataria } = req.body;

        try {
            if (destinataria === true) {
                // 1. Empresa Pai - Buscar todas as empresas filhas cujo empresaPai_uuid seja igual ao uuid
                const { data: empresasFilhas, error: errorFilhas } = await supabase
                    .from('empresas')
                    .select('nome, email')
                    .eq('empresaPai_uuid', uuid);

                if (errorFilhas || !empresasFilhas) {
                    console.error('Erro ao buscar empresas filhas:', errorFilhas);
                    return res.status(500).json({ message: 'Erro ao buscar empresas filhas' });
                }

                // 2. Buscar os dados da empresa pai
                const { data: empresaPai, error: errorPai } = await supabase
                    .from('empresas')
                    .select('nome, email')
                    .eq('uuid', uuid)
                    .single();

                if (errorPai || !empresaPai) {
                    console.error('Erro ao buscar dados da empresa pai:', errorPai);
                    return res.status(500).json({ message: 'Erro ao buscar dados da empresa pai' });
                }

                // 3. Retornar os dados da empresa pai e das empresas filhas
                return res.status(200).json({
                    paiNome: empresaPai.nome,
                    paiEmail: empresaPai.email,
                    empresasFilhas: empresasFilhas
                });
            } else if (destinataria === false) {
                // 4. Empresa Filha - Buscar dados da empresa filha e seu pai
                const { data: empresaFilha, error: errorFilha } = await supabase
                    .from('empresas')
                    .select('empresaPai_uuid, nome, email')
                    .eq('uuid', uuid)
                    .single();

                if (errorFilha || !empresaFilha) {
                    console.error('Erro ao buscar dados da empresa filha:', errorFilha);
                    return res.status(500).json({ message: 'Erro ao buscar dados da empresa filha' });
                }

                // 5. Se houver uma empresa pai, buscar os dados da empresa pai
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

                    // 6. Retornar os dados da empresa filha junto com os dados da empresa pai
                    return res.status(200).json({
                        nome: empresaFilha.nome,
                        email: empresaFilha.email,
                        paiNome: empresaPai.nome,
                        paiEmail: empresaPai.email
                    });
                } else {
                    // 7. Caso não haja uma empresa pai, retornar apenas os dados da empresa filha
                    return res.status(200).json({
                        nome: empresaFilha.nome,
                        email: empresaFilha.email,
                        paiNome: '',
                        paiEmail: ''
                    });
                }
            } else {
                // Caso destinataria seja null ou indefinida, retornar um erro de lógica
                return res.status(400).json({ message: 'O valor de destinataria é inválido.' });
            }
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
