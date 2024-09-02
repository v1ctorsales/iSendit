import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do e-mail
const supabaseEmailPw = process.env.EMAIL_PW;
const supabaseEmail = process.env.EMAIL;

export default async function sendFormFW(req, res) {
    if (req.method === 'POST') {
        const { uuid, regrafw, nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, obs, action, localidade } = req.body;

        console.log('Uuid:', uuid);
        console.log('Tipo do Form:', regrafw);

        if (!localidade) {
            return res.status(400).json({ message: 'Localidade é obrigatória' });
        }

        const { data: empresaFilhaData, error: empresaFilhaError } = await supabase
            .from('empresas')
            .select('nome, empresaPai_uuid')
            .eq('uuid', uuid)
            .single();

        if (empresaFilhaError) {
            console.error('Erro ao obter dados da empresa filha:', empresaFilhaError);
            return res.status(500).json({ message: 'Erro ao obter dados da empresa filha' });
        }

        const empresaNome = empresaFilhaData?.nome;
        const empresaPaiUuid = empresaFilhaData?.empresaPai_uuid;

        let empresaPaiNome = null;
        let empresaPaiEmail = null;
        if (empresaPaiUuid) {
            const { data: empresaPaiData, error: empresaPaiError } = await supabase
                .from('empresas')
                .select('nome, email')
                .eq('uuid', empresaPaiUuid)
                .single();

            if (empresaPaiError) {
                console.error('Erro ao obter dados da empresa pai:', empresaPaiError);
                return res.status(500).json({ message: 'Erro ao obter dados da empresa pai' });
            }

            empresaPaiNome = empresaPaiData?.nome;
            empresaPaiEmail = empresaPaiData?.email;
        }

        let firewallScript = `
        config firewall policy
        edit 0
        set name <span style='color: #FFB86C;'>"${nomeRegra}"</span>
        set srcintf <span style='color: #FFB86C;'>"${interfaceOrigem}"</span>
        set dstintf <span style='color: #FFB86C;'>"${interfaceDestino}"</span>
        set action <span style='color: #FFB86C;'>"${action === "accept" ? "accept" : "deny"}"</span>
        set srcaddr <span style='color: #FFB86C;'>"${objetoorigem}"</span>
        set dstaddr <span style='color: #FFB86C;'>"${objetodestino}"</span>
        set schedule <span style='color: #FFB86C;'>"always"</span>
        set service <span style='color: #FFB86C;'>"${porta}"</span>`;

        if (desc.trim() !== '') {
            firewallScript += `
        set comment <span style='color: #FFB86C;'>"${desc}"</span>`;
        }

        firewallScript += `
        next
        end`;
        // Adiciona log para o script gerado
        console.log('Script gerado:', firewallScript.trim());

        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    autor: 'victor@teste.com',
                    nome: nomeRegra,
                    descricao: desc,
                    observacao: obs,
                    type: regrafw,
                    porta: porta,
                    interface_origem: interfaceOrigem,
                    interface_destino: interfaceDestino,
                    objeto_origem: objetoorigem,
                    objeto_destino: objetodestino,
                    acao: action === "accept" ? 1 : 0,
                    localidade,
                    empresa_origem: empresaNome,
                    empresa_destino: empresaPaiNome,
                    empresa_origem_uuid: uuid,
                    script: firewallScript.trim(),  // Adiciona o script gerado à coluna script
                }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            return res.status(500).json({ message: 'Erro ao salvar dados' });
        }

        let observacaoHtml = '';
        if (obs && obs.trim() !== '') {
            observacaoHtml = `
<hr />
<p><strong>Observação:</strong></p>
<p style="background-color: #f0f0f0; padding: 10px;">${obs}</p>`;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: supabaseEmail,
                pass: supabaseEmailPw,
            },
        });

        const mailOptions = {
            from: supabaseEmail,
            to: empresaPaiEmail,
            subject: 'Nova solicitação de regra de Firewall criada',
            html: `
<h2>Script para a criação da regra:</h2>
<pre id="firewallScript" style="padding: 15px; background-color: #282A36; color:#50FA7B; font-size: medium ; 
font-family: Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;">
${firewallScript.trim()}
</pre>

<hr />
<h2>Informações detalhadas:</h2>
${observacaoHtml}
<p><strong>Localidade:</strong> "${localidade}"</p>
<p><strong>Nome da Regra:</strong> "${nomeRegra}"</p>
<p><strong>Interface Origem:</strong> "${interfaceOrigem}"</p>
<p><strong>Interface Destino:</strong> "${interfaceDestino}"</p>
<p><strong>Objeto Origem:</strong> "${objetoorigem}"</p>
<p><strong>Objeto Destino:</strong> "${objetodestino}"</p>
<p><strong>Ação:</strong> "${action === "accept" ? "Aceitar" : "Recusar"}"</p>
<p><strong>Porta:</strong> "${porta}"</p>
<p><strong>Descrição:</strong> "${desc}"</p>
<hr />
<p>Este email foi enviado através da plataforma iSendit</p>
            `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Erro ao enviar e-mail:', err);
                return res.status(500).json({ message: 'Erro ao enviar e-mail' });
            } else {
                console.log('E-mail enviado:', info.response);
                return res.status(200).json({ message: 'Dados recebidos e salvos com sucesso, e-mail enviado!' });
            }
        });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
