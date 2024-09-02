import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do e-mail
const supabaseEmailPw = process.env.EMAIL_PW;
const supabaseEmail = process.env.EMAIL;

export default async function sendFormData(req, res) {
    if (req.method === 'POST') {
        const { uuid, formType, nomeObj, ip, masc, desc, obs, fqdn, membros, localidade } = req.body;

        if (!uuid) {
            console.error('UUID não fornecido ou inválido');
            return res.status(400).json({ message: 'UUID é obrigatório' });
        }

        try {
            const { data: empresaFilhaData, error: empresaFilhaError } = await supabase
                .from('empresas')
                .select('nome, empresaPai_uuid')
                .eq('uuid', uuid)
                .single();

            if (empresaFilhaError) {
                console.error('Erro ao obter dados da empresa filha:', empresaFilhaError);
                return res.status(500).json({ message: 'Erro ao obter dados da empresa filha' });
            }

            const empresaNome = empresaFilhaData.nome;
            const empresaPaiUuid = empresaFilhaData.empresaPai_uuid;

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

                empresaPaiNome = empresaPaiData.nome;
                empresaPaiEmail = empresaPaiData.email;
            }

            let script = '';

            if (formType === "fqdn") {
                script = `
config firewall address
&nbsp;&nbsp;&nbsp;&nbsp;edit <span style='color: #FFB86C;'>"${nomeObj}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set type <span style='color: #FFB86C;'>fqdn</span>
&nbsp;&nbsp;&nbsp;&nbsp;set fqdn <span style='color: #FFB86C;'>"${fqdn}"</span>`;
                if (desc && desc.trim() !== '') {
                    script += `
&nbsp;&nbsp;&nbsp;&nbsp;set comment <span style='color: #FFB86C;'>"${desc}"</span>`;
                }
                script += `
next
end`;
            } else if (formType === "addressGroup") {
                const membrosArr = membros.split(',').map(membro => `<span style='color: #FFB86C;'>"${membro.trim()}"</span>`);
                const membrosFormatted = membrosArr.join(' ');
                script = `
config firewall addrgrp
&nbsp;&nbsp;&nbsp;&nbsp;edit <span style='color: #FFB86C;'>"${nomeObj}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set member ${membrosFormatted}`;
                if (desc && desc.trim() !== '') {
                    script += `
&nbsp;&nbsp;&nbsp;&nbsp;set comment <span style='color: #FFB86C;'>"${desc}"</span>`;
                }
                script += `
next
end`;
            } else if (formType === "ip") {
                script = `
config firewall address
&nbsp;&nbsp;&nbsp;&nbsp;edit <span style='color: #FFB86C;'>"${nomeObj}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set subnet <span style='color: #FFB86C;'>"${ip}${masc}"</span>`;
                if (desc && desc.trim() !== '') {
                    script += `
&nbsp;&nbsp;&nbsp;&nbsp;set comment <span style='color: #FFB86C;'>"${desc}"</span>`;
                }
                script += `
next
end`;
            }

            console.log('Script gerado:', script.trim());

            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    {
                        autor: 'victor@teste.com',
                        nome: nomeObj,
                        descricao: desc,
                        observacao: obs,
                        type: formType,
                        fqdn: fqdn,
                        membros: membros,
                        localidade,
                        empresa_origem: empresaNome,
                        empresa_destino: empresaPaiNome,
                        empresa_origem_uuid: uuid,
                        script: script.trim(),
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
                subject: `Nova solicitação de configuração de ${formType === "fqdn" ? "FQDN" : formType === "addressGroup" ? "Address Group" : "IP"}`,
                html: `
                    <h2>Script para a criação de ${formType === "fqdn" ? "FQDN" : formType === "addressGroup" ? "Address Group" : "IP"}:</h2>
                    <pre style="padding: 15px; background-color: #282A36; color:#50FA7B; font-size: medium;
                    font-family: Consolas, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace;">
                    ${script}
                    </pre>

                    <hr />
                    <h2>Informações detalhadas:</h2>
                    ${observacaoHtml}
                    <p><strong>Localidade:</strong> "${localidade}"</p>
                    <p><strong>Nome do Objeto:</strong> "${nomeObj}"</p>
                    ${formType === "fqdn" ? `<p><strong>FQDN:</strong> "${fqdn}"</p>` : ''}
                    ${formType === "addressGroup" ? `<p><strong>Membros:</strong> "${membros}"</p>` : ''}
                    ${formType === "ip" ? `<p><strong>IP:</strong> "${ip}"</p><p><strong>Máscara:</strong> "${masc}"</p>` : ''}
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
        } catch (error) {
            console.error('Erro interno do servidor:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
