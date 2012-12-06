require 'spec_helper'

describe SalesController do
	before :each do 
		@plant = FactoryGirl.create :plant
	end # each
  describe "GET 'index'" do
    login_user :sales
    it "returns http success" do
      get 'index', :plant_id => @plant.id
      response.should be_success
    end
  end
  describe "creation" do 
  	before :each do 
  		@company = FactoryGirl.create :company
      @material = {
        :name => "heroin" ,
        :quantity => 50,
        :units => "pounds" ,
        :price => 2000
      } # material
  		@create = lambda do 
  			post :create, :plant_id => @plant
  		end # create
  	end # each
  	context "as sales" do 
  		login_user :sales
      before :each do 
        @key = "sale::#{@plant.name}::#{@current_user.id}" 
        @create.call
      end # each
      it "should change the database" do 
        
        Sale.find( controller.sale.key).should_not be_nil
      end # it
      describe 'materialize' do 
        # let(:sale) {Sale.find "sale::#{@plant.name}::#{@current_user.id}" }
        before :each do 
          @materialize = lambda do 
            post :material, :plant_id => @plant, :id => @key, :material => @material
          end # lambda
        end # each
        it "should not have a null key" do 
          @current_user.id.should_not be_nil
          @plant.name.should_not be_nil
        end # it
        describe "finish" do 
          before :each do 
            @materialize.call
            @finish = lambda do 
              post :finish, :plant_id => @plant, :id => @key, :company => @company
            end # finish
          end # each
          it "should create an order" do 
            @finish.should change(Order, :count).by 1
          end # it
          it "should create some heroin" do 
            @finish.should change(Material, :count).by 1
          end # it
        end # finish
      end # materialize
  	end # as sales
  end # creation
end # salescontroller
