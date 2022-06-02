import "./styles.css";
import { useState, useEffect } from "react";
import useSWR from "swr";

function Fieldset({ label, children }) {
  return (
    <fieldset>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
}

function useCommit(username) {
  const debounced = useDebounce(username);

  const { data: user } = useSWR(
    username?.length > 3 ? `https://api.github.com/users/${debounced}` : null
  );
  const { data: repos } = useSWR(
    username?.length > 3
      ? `https://api.github.com/users/${debounced}/repos?sort=updated&per_page=1`
      : null
  );
  const { data: commits } = useSWR(
    () =>
      `https://api.github.com/repos/${debounced}/${repos[0].name}/commits?per_page=1`
  );

  return {
    name: user?.name,
    avatar: user?.avatar_url,
    commit: commits?.[0]?.url
  };
}

export default function App() {
  const [username, setUsername] = useState("jporfirio");
  const { name, avatar, commit } = useCommit(username);

  return (
    <div className="App">
      <Fieldset label={<label htmlFor="username">Username here</label>}>
        <input
          id="username"
          placeholder="jporfirio"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Fieldset>

      {name ? (
        <Fieldset
          label={
            <>
              User information for <strong>{name}</strong>
            </>
          }
        >
          <img alt="user avatar" src={avatar} />
        </Fieldset>
      ) : null}

      {commit ? (
        <Fieldset label="Latest Commit">
          <a href={commit}>{commit}</a>
        </Fieldset>
      ) : null}
    </div>
  );
}

function useDebounce(value, delay = 500) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
