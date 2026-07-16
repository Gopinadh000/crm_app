

export const ReS = (res, {data = {}, message = "Success", statusCode =200, status = true, ...rest}) => {
    return res.status(statusCode).json({
        status,
        statusCode,
        message,
        data,
        ...rest,
    });
}

export const ReE = (res, {data = {}, message = "Something went wrong", statusCode =400, status = false, ...rest}) => {
    return res.status(statusCode).json({
        status,
        statusCode,
        message,
        data,
        ...rest,
    });
}