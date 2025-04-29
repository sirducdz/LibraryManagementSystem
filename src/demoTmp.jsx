import { UseAuth, UseProvider,NewObject  } from "./authContextTmp";
export function App1() {
  const auth = UseAuth();
  NewObject.name = "1234567890";
  console.log("NewObject", NewObject);
  console.log("Auth in App", auth);
  return (
    <div className="App">
      <h1>Demo App</h1>
      <p>Check the console for context values.</p>
    </div>
  );
}
