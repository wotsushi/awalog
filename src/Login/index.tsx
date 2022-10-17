import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";

import AWANav from "AWANav";
import { useLogin, useUser } from "lib/firebase";

import "./style.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedLogin, setFailedLogin] = useState(false);
  const user = useUser();
  const login = useLogin(() => setFailedLogin(true));
  return (
    <>
      <AWANav disabledStats={false} user={user} />
      {failedLogin && (
        <Alert variant="danger">
          メールアドレスまたはパスワードが正しくありません
        </Alert>
      )}
      <Form className="login-form">
        <Form.Group controlId="formBasicEmail">
          <Form.Label>メールアドレス</Form.Label>
          <Form.Control
            type="email"
            placeholder="hoge@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>パスワード</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={() => login(email, password)}>
          ログイン
        </Button>
      </Form>
    </>
  );
};

export default Login;
