// This is the function that generates an appender function
function stdoutAppender(layout: any, timezoneOffset: any) {
    // This is the appender function itself
    return (loggingEvent: any) => {
        process.stdout.write(`${layout(loggingEvent, timezoneOffset)}\n`);
    };
}

// stdout configure doesn't need to use findAppender, or levels
function configure(config: any, layouts: any) {
    // the default layout for the appender
    let layout = layouts.colouredLayout;
    // check if there is another layout specified
    if (config.layout) {
        // load the layout
        layout = layouts.layout(config.layout.type, config.layout);
    }
    //create a new appender instance
    return stdoutAppender(layout, config.timezoneOffset);
}

//export the only function needed
exports.configure = configure;