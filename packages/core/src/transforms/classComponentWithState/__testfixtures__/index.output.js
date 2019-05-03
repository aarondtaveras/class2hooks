import React, { useState } from "react";

const SimpleComponents = () => {

  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
    </div>
  );
};

export default SimpleComponents
