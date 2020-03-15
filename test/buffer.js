function test(retry) {
    if (retry > 100) {
        return;
    }
    console.log(retry);
    test(retry++)

}

test(1);