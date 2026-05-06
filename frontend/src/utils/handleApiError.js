export function handleApiError(err, navigate, setInlineError, showFailure, options = {}){
    const status = err?.response?.status;
    const message = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message ||  
        "An unexpected error occurrred";

    const stayOnPageStatuses = options.stayOnPageStatuses || [400, 401, 409];
    
    if(stayOnPageStatuses.includes(status)){
        if(setInlineError) setInlineError(message);
        if(showFailure) showFailure(message);
        return;
    }
    
    if(status === 404){
        navigate("/error",{
            replace: true,
            state: {
                error: {
                    status: 404,
                    title: "Not found",
                    message,
                },
            },
        });
        return;
    }

    if(status === 500){
        navigate("/error",{
            replace: true,
            state: {
                error: {
                    status: 500,
                    title: "Server error",
                    message,
                },
            },
        });
        return;
    }

    if(status === 403){
        navigate("/error",{
            replace: true,
            state: {
                error: {
                    status: 403,
                    title: "Access denied",
                    message,
                },
            },
        });
        return;
    }

    if(status === 401 && options.redirect401){
        navigate("/login");
        return;
    }

    if(setInlineError){
        setInlineError(message);
    }
    if(showFailure){
        showFailure(message);
    }
}