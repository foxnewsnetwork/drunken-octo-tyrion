module ExposureHelper

	def create
		if get_model.save
			flash[:success] = t(:success, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :create, :flash])
			redirect_to get_model
		else
			flash.now[:error] = t(:error, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :create, :flash])
			render :new
		end
	end # create

	def update
		if get_model.save
			flash[:success] = t(:success, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :update, :flash])
			redirect_to get_model
		else
			flash.now[:error] = t(:error, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :update, :flash])
			render :edit
		end
	end # update

	def destroy
		if get_model.destroy
			flash[:success] = t(:success, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :destroys, :flash])
			redirect_to self.send( )
		else
			flash.now[:error] = t(:error, :scope => [get_model.class.to_s.downcase.to_sym, :controllers, :destroys, :flash])
			render :index
		end
	end # destroy
end # ExposureHelper