import classNames from "classnames";
import React, { useEffect } from "react";
import { BiLoader } from "react-icons/bi";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import useFetch, { CachePolicies } from "use-http";
import { Map } from "./components/Map";
import { DCSMap, Georgia } from "./dcs/maps/DCSMap";
import { Syria } from "./dcs/maps/Syria";
import { Server, serverStore } from "./stores/ServerStore";
import { route } from "./util";

function ServerConnectModal() {
  const { loading, error, data: servers, get } = useFetch<
    Array<{ name: string }>
  >(
    process.env.NODE_ENV === "production"
      ? `/api/servers`
      : `http://localhost:7789/api/servers`,
    [],
  );

  return (
    <div
      className={classNames(
        "flex flex-col overflow-x-hidden overflow-y-auto absolute",
        "inset-0 z-50 bg-gray-100 mx-auto my-auto max-w-3xl",
        "border border-gray-200 rounded-sm shadow-md",
      )}
      style={{ maxHeight: "50%" }}
    >
      <div className="flex flex-row items-center p-2 border-b border-gray-400">
        <div className="text-2xl">Select Server</div>
      </div>
      <div className="flex flex-row p-2 h-full">
        {loading &&
          (
            <BiLoader
              className="h-6 w-6 text-blue-400 animate-spin my-auto mx-auto"
            />
          )}
        {error && (
          <div>
            Something went wrong accessing the backend server. Please check your
            connection and <button onClick={() => get()}>try again</button>.
          </div>
        )}
        {servers &&
          (
            <div
              className="flex flex-col gap-1 w-full text-center text-3xl font-bold"
            >
              {servers.map((
                it,
              ) => (
                <Link
                  to={`/servers/${it.name}`}
                  className="p-2 bg-gray-100 hover:bg-gray-200 border-gray-400 border rounded-sm shadow-sm w-full"
                >
                  {it.name}
                </Link>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function ServerContainer({ serverName }: { serverName: string }) {
  const [refLat, refLng] = serverStore((state) => {
    const globalObj = state.entities.get(0);
    if (!globalObj) return [undefined, undefined];
    return [
      globalObj.properties.ReferenceLatitude as number | undefined,
      globalObj.properties.ReferenceLongitude as number | undefined,
    ];
  });

  const { response, data: server, loading, error } = useFetch<Server>(
    route(`/servers/${serverName}`),
    { cachePolicy: CachePolicies.NO_CACHE },
    [serverName],
  );

  useEffect(() => {
    if (server && !error && !loading) {
      serverStore.setState({ server: server });
      return () => serverStore.setState({ server: null });
    }
  }, [server, error, loading]);

  if (response.status === 404) {
    return <Redirect to="/" />;
  }

  if (error) {
    return (
      <div className="p-2 border border-red-400 bg-red-100 text-red-400">
        Error: {error.toString()}
      </div>
    );
  }

  if (loading || !refLat || !refLng) {
    return (
      <BiLoader
        className="h-6 w-6 text-blue-400 animate-spin my-auto mx-auto"
      />
    );
  }

  let dcsMap: DCSMap | null = null;
  if ((refLat > 28 && refLat < 32) && (refLng > 29 && refLng < 33)) {
    dcsMap = Syria;
  } else if ((refLat > 37 && refLat < 41) && (refLng > 34 && refLng < 38)) {
    dcsMap = Georgia;
  } else {
    console.log(refLat, refLng);
    return (
      <div className="p-2 border border-red-400 bg-red-100 text-red-400">
        Failed to detect map.
      </div>
    );
  }

  return <Map dcsMap={dcsMap} />;
}

function App() {
  return (
    <div
      className="bg-gray-700 max-w-full max-h-full w-full h-full"
    >
      <Switch>
        <Route exact path="/" component={ServerConnectModal} />
        <Route
          exact
          path="/servers/:serverName"
          render={({ match: { params: { serverName } } }) => {
            return <ServerContainer serverName={serverName} />;
          }}
        />
      </Switch>
    </div>
  );
}

export default App;
