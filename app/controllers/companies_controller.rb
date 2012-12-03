class CompaniesController < ApplicationController
	expose(:company)
	before_filter :allow_sales, :only => [:create, :update, :destroy]

	def create
		if company.save
			flash[:success] = t(:success, :scope => [:company, :controllers, :create, :flash])
			redirect_to company
		else
			flash.now[:error] = t(:error, :scope => [:company, :controllers, :create, :flash])
			render :new
		end
	end # create

	def update
		if company.save
			flash[:success] = t(:success, :scope => [:company, :controllers, :update, :flash])
			redirect_to company
		else
			flash.now[:error] = t(:error, :scope => [:company, :controllers, :update, :flash])
			render :edit
		end
	end # update

	def destroy
		if company.destroy
			flash[:success] = t(:success, :scope => [:company, :controllers, :destroys, :flash])
			redirect_to companies_path
		else
			flash.now[:error] = t(:error, :scope => [:company, :controllers, :destroys, :flash])
			render :index
		end
	end # destroy
end
