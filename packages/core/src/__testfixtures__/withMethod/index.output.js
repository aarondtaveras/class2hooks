import React, { useState } from "react";

const testMethod = () => {
    console.log("Hello");
}

const WithMethod = () => {
    return (
        <div>
            <h1>Hello</h1>
            <button onClick={testMethod}>Test Button</button>
        </div>
    )
}

export default WithMethod