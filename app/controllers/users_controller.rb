class UsersController < ApplicationController
	respond_to :html, :js, :json
	expose(:users) { User.all }
	expose(:user) { User.find(params[:id])}

	before_filter :allow_management, :only => :level_up
	def update
		if user.update_attributes(params[:user])
			flash[:success] = t(:success, :scope => [:user, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:user, :controller, :update])
		end
		respond_with user
	end # update

	def level
		user.level = params[:level].to_i
		if user.save
			flash[:success] = t(:success, :scope => [:user, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:user, :controller, :update])
		end
		respond_with user
	end # level_up
end
