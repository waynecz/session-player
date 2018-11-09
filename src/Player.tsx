import * as React from "react";

function Player() {
  const [name] = React.useState("mark");

  return <div className="player">{name}</div>;
}

export default Player;
