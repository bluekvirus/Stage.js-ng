var expect = chai.expect;

describe("Stagejs v2 Core", function(){

	describe("Application", function(){
		it("should be globally available", function(done){
			expect(Application).to.exist;
			expect(app).to.exist;
		});
	});

});