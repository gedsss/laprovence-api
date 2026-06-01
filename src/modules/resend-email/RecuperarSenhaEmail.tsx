interface Props {
  resetUrl: string
}

export function RecuperarSenhaEmail({ resetUrl }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '32px' }}>
      <h2>Recuperação de senha</h2>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>
        Clique no link abaixo para criar uma nova senha. O link é válido por{' '}
        <strong>15 minutos</strong>.
      </p>
      <a href={resetUrl} style={{ color: '#00300D', fontWeight: 'bold' }}>
        Redefinir minha senha
      </a>
      <p style={{ marginTop: '32px', fontSize: '12px', color: '#888' }}>
        Se você não solicitou isso, ignore este e-mail.
      </p>
    </div>
  )
}
