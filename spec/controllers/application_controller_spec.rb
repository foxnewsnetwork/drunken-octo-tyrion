require 'spec_helper'

describe ApplicationController do 
	describe "tsundere" do 
		it "should respond to attr_tsundere" do 
			ApplicationController.should respond_to :attr_tsundere
		end # it
	end # tsundere
end # Application