describe('SetUp Test', () =>{
    it('Should always be true', () => {
        assert.isTrue(true);
    });
});

describe("IsNumber() Tests", () => {    
    it("Should retrive true for '0'", () => {            
        assert.isTrue(isNumber(0));
    });

    it("Should retrive true for '32'", () => {            
        assert.isTrue(isNumber(32));
    });

    it('Should retrive false for "" | empty string', () => {            
        assert.isFalse(isNumber(''));
    });

    it("Should retrive true for '525'", () => {            
        assert.isTrue(isNumber(525));
    });

    it("Should retrive false for 'abcd'", () => {            
        assert.isFalse(isNumber('abcd'));
    });

    it("Should retrive false for 'a32cd'", () => {            
        assert.isFalse(isNumber('a32cd'));
    });

    it("Should retrive false for '525abcd'", () => {            
        assert.isFalse(isNumber('525abcd'));
    });
});

describe("IsNumbers() Tests", () => {
    let arrNums = [1, 2, 3, 4, 5];
    let arrObjs = [ arrNums, 10,() => {}, { name : 'Vasy' } ];

    it("Should retrive true for each of the 5 numbers", () => {            
        assert.isTrue(isNumbers(arrNums));
    });

    it("Should retrive false for each of the 5 objects", () => {            
        assert.isFalse(isNumbers(arrObjs));
    });
});