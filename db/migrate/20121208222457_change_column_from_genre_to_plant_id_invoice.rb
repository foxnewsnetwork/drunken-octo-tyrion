class ChangeColumnFromGenreToPlantIdInvoice < ActiveRecord::Migration
  def up
  	change_column :invoices, :genre, :integer
  	rename_column :invoices, :genre, :plant_id
  end

  def down
  	rename_column :invoices, :plant_id, :genre
  	change_column :invoices, :genre, :string
  end
end
