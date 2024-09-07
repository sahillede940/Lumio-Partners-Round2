import { useEffect, useState } from "react";
import TextEditor from "./TextEditor";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const URL =
  "http://lumio-partners-server.centralindia.cloudapp.azure.com:5000/";

function App() {
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recipientsEmail, setRecipientEmail] = useState([""]);
  const [app_password, setAppPassword] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const fetchEmail = async () => {
    toast("Generating email...");
    try {
      const response = await fetch(URL + "/api/generate_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHtml(data.text.body.replace(/\n/g, "<br/>"));
        setSubject(data.text.subject);
        toast.dismiss();
        toast("Email generated successfully!");
      } else {
        toast.dismiss();
        toast("Failed to generate email");
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast("Failed to generate email");
    }
  };

  const sendEmail = async () => {
    toast("Sending email...");
    try {
      console.log(senderEmail, app_password, recipientsEmail);
      if (!senderEmail || !app_password || !recipientsEmail) {
        toast.dismiss();
        toast("Please fill in all the fields");
        return;
      }

      const response = await fetch(URL + "/api/send_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: senderEmail,
          password: app_password,
          recipients: recipientsEmail,
          subject,
          message: html,
        }),
      });

      if (response.ok) {
        toast.dismiss();
        const message = await response.json();
        toast(message.message);
      } else {
        toast.dismiss();
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast("Failed to send email");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="email-generator">
        <div className="email-info">
          <h2 className="title">Email Addresses</h2>
          <label htmlFor="sender-email" className="label">
            Your Email:
          </label>
          <input
            type="email"
            id="sender-email"
            name="sender-email"
            value={senderEmail}
            className="input"
            onChange={(e) => setSenderEmail(e.target.value)}
          />
          <label htmlFor="sender-email" className="label">
            App Password:
          </label>
          <input
            type="password"
            id="app-password"
            value={app_password}
            className="input"
            onChange={(e) => setAppPassword(e.target.value)}
          />
          <label htmlFor="recipient-email" className="label">
            Recipient's Email:
          </label>

          {recipientsEmail.map((email, index) => (
            <div className="reciptents-container">
              <input
                type="email"
                key={index}
                value={email}
                className="input"
                onChange={(e) => {
                  const newEmails = [...recipientsEmail];
                  newEmails[index] = e.target.value;
                  setRecipientEmail(newEmails);
                }}
              />
              <button
                className="remove-email"
                onClick={() => {
                  const newEmails = [...recipientsEmail];
                  newEmails.splice(index, 1);
                  setRecipientEmail(newEmails);
                }}
              >
                X{" "}
              </button>
            </div>
          ))}
          <button
            className="button"
            onClick={() => {
              setRecipientEmail([...recipientsEmail, ""]);
            }}
          >
            add email
          </button>
        </div>

        <h1 className="title">Email Generator</h1>
        <label htmlFor="prompt" className="label">
          Enter your prompt:
        </label>
        <textarea
          id="prompt"
          name="prompt"
          className="input"
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="button" onClick={fetchEmail}>
          Generate Email
        </button>
        {html && (
          <div className="email-content">
            <h3 className="sub-title">Subject</h3>
            <input
              type="text"
              value={subject}
              className="sub-input"
              onChange={(e) => setSubject(e.target.value)}
            />
            <h3 className="sub-title">Body</h3>
            <TextEditor html={html} setHtml={setHtml} />
            <button className="button" onClick={sendEmail}>
              Send Email
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
