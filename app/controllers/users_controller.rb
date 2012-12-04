class UsersController < ApplicationController
	respond_to :html, :js, :json
	expose(:users) { User.where(params.except(params.except(:action, :controller, :format))) }
	expose(:user) { User.find(params[:id])}

	def update
		if user.update_attributes(params[:user])
			flash[:success] = t(:success, :scope => [:user, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:user, :controller, :update])
		end
		respond_with user
	end # update
end
