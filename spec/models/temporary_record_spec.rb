require 'spec_helper'

describe TemporaryRecord do 
	describe 'sanity' do 
		it "should exist" do 
			TemporaryRecord.should_not be_nil
		end # it
	end # sanity
	context "simple implementation" do 
		class Ghost
			include TemporaryRecord
			attr_accessor :name, :occupation

			def initialize n,o
				name = n
				occupation = o
			end # initialize

			def serialize
				{
					:name => name ,
					:occupation => occupation
				}
			end # serialize

			def key
				name
			end # key

			def self.deserialize hash
				new hash["name"], hash["occupation"]
			end # deserialize
		end # Ghost
		describe 'correct implementation' do 
			[:find, :deserialize, :connection].each do |function|
				it "should respond_to #{function}" do 
					Ghost.respond_to?(function).should be_true
				end # it
			end # function
			it "should have a valid connection" do 
				Ghost.connection.should_not be_nil
			end # it
		end # correct
		describe "saving-retrieving" do 
			before :each do 
				@ghost = Ghost.new "casper", "being beta"
				@ghost.persist
			end # each
			it "should allow me to retrieve" do 
				ghost = Ghost.find @ghost.key
				ghost.name.should eq @ghost.name
				ghost.occupation.should eq @ghost.occupation
			end # it
		end # saving
	end # simple implementation
end # TemporaryRecord::Base